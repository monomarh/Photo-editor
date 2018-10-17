document.addEventListener('DOMContentLoaded', function() {
  let canvas = new fabric.Canvas('imageCanvas');      
  canvas.selection = false;

  function handleFileSelect(evt) {
    let files = evt.target.files;

    for (let i = 0, f; f = files[i]; i++) {

      if (!f.type.match('image/*')) {
        alert("Please, choose image");
        continue;
      }

      let reader = new FileReader();
      reader.onload = (function() {
        return function(e) {
          fabric.Image.fromURL(e.target.result, function(oImg) {
            oImg.scale(1);
            canvas.add(oImg);
          });
        };
      })(f);
      reader.readAsDataURL(f);
    }
  }

  function handleTextAdd() {

    let inputText = document.getElementById('inputText').value;

    let colorChoose = function() {
      return document.getElementById('colorChoose').value;
    };

    let fontFaceChoose = function() {
      return $('.active').text();
    };

    let text = new fabric.Text(inputText, { 
      left: 100,
      top: 100,
      fontFamily: fontFaceChoose,
      fill: colorChoose
    });

    canvas.add(text);
  }

  function handleArrowAdd(event) {

    let color = "";
    let choosedColor = event.target.textContent;

    if(choosedColor === "Black")
      color = "#000000";
    else if(choosedColor === "Blue")
      color = "#0000FF";
    else 
      color = "#FF0000";

    canvas.forEachObject(function(o) {
      o.selectable = false;
    });

    function arrowDraw() {
      let pointer = canvas.getPointer(event.e);
      endX = pointer.x;
      endY = pointer.y;
      drawArrow(startX, startY, endX, endY);
    }

    let startX, startY, endX, endY;

    canvas.on('mouse:down', function() {
        let pointer = canvas.getPointer(event.e);
        startX = pointer.x;
        startY = pointer.y;
    });

    canvas.on('mouse:up', arrowDraw);

    function drawArrow(fromx, fromy, tox, toy) {

      let angle = Math.atan2(toy - fromy, tox - fromx);
      let headlen = 15;  

      tox = tox - (headlen) * Math.cos(angle);
      toy = toy - (headlen) * Math.sin(angle);

      let points = [
        {
          x: fromx,
          y: fromy
        }, {
          x: fromx - (headlen / 4) * Math.cos(angle - Math.PI / 2), 
          y: fromy - (headlen / 4) * Math.sin(angle - Math.PI / 2)
        },{
          x: tox - (headlen / 4) * Math.cos(angle - Math.PI / 2), 
          y: toy - (headlen / 4) * Math.sin(angle - Math.PI / 2)
        }, {
          x: tox - (headlen) * Math.cos(angle - Math.PI / 2),
          y: toy - (headlen) * Math.sin(angle - Math.PI / 2)
        },{
          x: tox + (headlen) * Math.cos(angle),  // tip
          y: toy + (headlen) * Math.sin(angle)
        }, {
          x: tox - (headlen) * Math.cos(angle + Math.PI / 2),
          y: toy - (headlen) * Math.sin(angle + Math.PI / 2)
        }, {
          x: tox - (headlen / 4) * Math.cos(angle + Math.PI / 2),
          y: toy - (headlen / 4) * Math.sin(angle + Math.PI / 2)
        }, {
          x: fromx - (headlen / 4) * Math.cos(angle + Math.PI / 2),
          y: fromy - (headlen / 4) * Math.sin(angle + Math.PI / 2)
        },{
          x: fromx,
          y: fromy
        }
      ];

      let pline = new fabric.Polyline(points, {
        fill: color,
        stroke: color,
        opacity: 1,
        strokeWidth: 2,
        originX: 'left',
        originY: 'top',
        selectable: true
      });

      canvas.add(pline);
      canvas.renderAll();
      canvas.forEachObject(function(o) {
        o.selectable = true;
      });
      canvas.off('mouse:up', arrowDraw);
    }
  }

  function handleSaver() {
    let canvasIMG = document.getElementById("imageCanvas");
    cropIMG = trim(canvasIMG);
    ReImg.fromCanvas(cropIMG).downloadPng();
  }

  function handleDelete() {
    canvas.remove(canvas.getActiveObject());
  }

  document.getElementById('saveImg').addEventListener('click', handleSaver);
  document.getElementById('textAdd').addEventListener('click', handleTextAdd);
  document.getElementById('arrowAdd').addEventListener('click', handleArrowAdd);
  document.getElementById('deleteImg').addEventListener('click', handleDelete);
  document.getElementById('imageLoader').addEventListener('change', handleFileSelect);

  $('.dropdown-item').on('click', function(event) {
    if($(event.target).parent().prop('id') === "arrowAdd") return;
    $('.active').removeClass('active');
    $(event.target).addClass('active');
    $("#textFont").text($(event.target).text());
  });

  function trim(c) {
    let ctx = c.getContext('2d'),
      copy = document.createElement('canvas').getContext('2d'),
      pixels = ctx.getImageData(0, 0, c.width, c.height),
      l = pixels.data.length,
      i,
      bound = {
        top: null,
        left: null,
        right: null,
        bottom: null
      },
      x, y;

    for (i = 0; i < l; i += 4) {
      if (pixels.data[i+3] !== 0) {
        x = (i / 4) % c.width;
        y = ~~((i / 4) / c.width);
    
        if (bound.top === null) {
          bound.top = y;
        }
        
        if (bound.left === null) {
          bound.left = x; 
        } else if (x < bound.left) {
          bound.left = x;
        }
        
        if (bound.right === null) {
          bound.right = x; 
        } else if (bound.right < x) {
          bound.right = x;
        }
        
        if (bound.bottom === null) {
          bound.bottom = y;
        } else if (bound.bottom < y) {
          bound.bottom = y;
        }
      }
    }
      
    let trimHeight = bound.bottom - bound.top,
        trimWidth = bound.right - bound.left,
        trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);
  
    copy.canvas.width = trimWidth;
    copy.canvas.height = trimHeight;
    copy.putImageData(trimmed, 0, 0);
    
    return copy.canvas;
  }
});