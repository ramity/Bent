(function() {
  var canvas = document.getElementById('container');
  var THREE = require('THREE');
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 100);
  var renderer = new THREE.WebGLRenderer({
    canvas : canvas,
    antialias : true
  });

  renderer.setClearColor(0x2c3e50);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMapEnabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var cube = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshLambertMaterial({color: 0xffffff});
  var character = new THREE.Mesh(cube, material);
  character.position = {x:0,y:0,z:0};
  character.castShadow = true;
  character.receiveShadow = true;

  scene.add(character);
  camera.position.z = 5;
  character.add(camera);

  // var grid = new THREE.GridHelper(10, 10);
  // grid.rotation.x = Math.PI / 2;
  // grid.position.z = -0.49;
  // scene.add(grid);

  var fs = require('fs');
  var map = JSON.parse(fs.readFileSync('./map.json', 'utf8'));

  for(z in map)
  {
    //defaults
    color = "0xffffff";
    receiveShadow = true;
    castShadow = true;

    if(map[z].hasOwnProperty('size'))
    {
      geometry = new THREE.BoxGeometry(
        map[z].size.w,
        map[z].size.h,
        map[z].size.d
      );
    }
    else
    {
      throw new Error("Size is not defined for map obect " + z);
    }

    if(map[z].hasOwnProperty('options'))
    {
      if(map[z].options.hasOwnProperty('color'))
      {
        color = map[z].options.color;
      }
      else
      {
        console.log('color not specificed for map object ' + z);
      }

      if(map[z].options.hasOwnProperty('receiveShadow'))
      {
        receiveShadow = map[z].options.receiveShadow;
      }
      else
      {
        console.log('receiveShadow not specificed for map object ' + z);
      }

      if(map[z].options.hasOwnProperty('castShadow'))
      {
        castShadow = map[z].options.castShadow;
      }
      else
      {
        console.log('castShadow not specificed for map object ' + z);
      }
    }

    temp = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({color: color})
    );

    if(map[z].hasOwnProperty('position'))
    {
      temp.position.set(
        map[z].position.x,
        map[z].position.y,
        map[z].position.z
      );
    }
    else
    {
      throw new Error("Position is not defined for map obect " + z);
    }

    temp.castShadow = castShadow;
    temp.receiveShadow = receiveShadow;
    scene.add(temp);
  }

  floor = new THREE.BoxGeometry(9, 9, 1);
  floorMaterial = new THREE.MeshLambertMaterial({color: 0xe67e22});
  floorMesh = new THREE.Mesh(floor, floorMaterial);
  floorMesh.receiveShadow = true;
  floorMesh.position.z = -1;
  scene.add(floorMesh);

  light = new THREE.PointLight(0xffee88, 1.5, 10);
  light.position.set(0, 0, 1);
  light.castShadow = true;
  scene.add(light);

  helper = new THREE.PointLightHelper( light );
  scene.add( helper );

  light = new THREE.AmbientLight(0x404040);
  scene.add(light);

  function render()
  {
  	requestAnimationFrame(render);

    if(enableRotate == 0 || enableRotate == 1)
    {
      if(rotationDirection == 'CCW')
      {
        if(rotationStep < 15)
        {
          character.rotateZ(rotateSpeed);
          rotationStep++;
        }
        else
        {
          rotationStep = 0;
          enableRotate++;

          degrees = Math.round(character.rotation.z * (180 / Math.PI));
          character.rotation.z = degrees * (Math.PI / 180);

          console.log(degrees, character.position.x, character.position.y);

          enableMovement = true;

          if(facing - 1 >= 0)
          {
            facing--;
          }
          else
          {
            facing = 4;
          }
        }
      }
      else if(rotationDirection == 'CW')
      {
        if(rotationStep < 15)
        {
          character.rotateZ(-rotateSpeed);
          rotationStep++;
        }
        else
        {
          rotationStep = 0;
          enableRotate++;

          degrees = Math.round(character.rotation.z * (180 / Math.PI));
          character.rotation.z = degrees * (Math.PI / 180);

          console.log(degrees, character.position.x, character.position.y);

          enableMovement = true;

          if(facing + 1 < faces.length)
          {
            facing++;
          }
          else
          {
            facing = 0;
          }
        }
      }
    }

  	renderer.render(scene, camera);
  }

  render();

  window.addEventListener('resize', function()
  {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  });

  var kd = require('keydrown');

  var moveSpeed = 0.05;
  var rotateSpeed = Math.PI / 30;
  var movePercision = 2;
  var enableRotate = 2;
  var rotationDirection = '';
  var rotationStep = 0;
  var facing = 0;
  var faces = ['N', 'E', 'S', 'W'];
  var enableMovement = true;

  kd.Q.down(function()
  {
    if(enableRotate == 2)
    {
      rotationDirection = 'CCW';
      enableRotate = 0;
      enableMovement = false;
    }
  });
  kd.Q.up(function()
  {
    if(enableRotate == 0)
      enableRotate++;
  });
  kd.E.down(function()
  {
    if(enableRotate == 2)
    {
      rotationDirection = 'CW';
      enableRotate = 0;
      enableMovement = false;
    }
  });
  kd.E.up(function()
  {
    if(enableRotate == 0)
      enableRotate++;
  });

  kd.W.down(function()
  {
    if(testMove('y', moveSpeed))
      character.translateY(moveSpeed);
  });
  kd.A.down(function()
  {
    if(testMove('x', -moveSpeed))
      character.translateX(-moveSpeed);
  });
  kd.S.down(function()
  {
    if(testMove('y', -moveSpeed))
      character.translateY(-moveSpeed);
  });
  kd.D.down(function()
  {
    if(testMove('x', moveSpeed))
      character.translateX(moveSpeed);
  });
  kd.SHIFT.down(function()
  {
    moveSpeed = 0.1;
  });
  kd.SHIFT.up(function()
  {
    moveSpeed = 0.05;
  });
  kd.run(function()
  {
    kd.tick();
  });

  function testMove(axis, moveSpeed)
  {
    if(enableMovement)
    {
      cr = character.rotation.z;

      if(axis == 'rz')
        cr = cr + moveSpeed;

      character.position.x = parseFloat(character.position.x.toFixed(movePercision));
      character.position.y = parseFloat(character.position.y.toFixed(movePercision));

      x = character.position.x;
      y = character.position.y;

      if(axis == 'x')
      {
        if(facing == 0 || facing == 2)
          x = character.position.x + moveSpeed;
        else
          y = character.position.y + moveSpeed;
      }
      else if (axis == 'y')
      {
        if(facing == 0 || facing == 2)
          y = character.position.y + moveSpeed;
        else
          x = character.position.x + moveSpeed;
      }

      if(axis == 'x' && (facing == 'N' || facing == 'S'))
      if(axis == 'y' && (facing == 'E' || facing == 'W'))

      x = parseFloat(x.toFixed(movePercision));
      y = parseFloat(y.toFixed(movePercision));

      console.log(x, y);

      cw = character.scale.x;
      ch = character.scale.y;

      cx = x;
      cy = y;

      cx = cx - character.position.x;
      cy = cy - character.position.y;

      // cx = (cx * Math.cos(cr)) - (cy * Math.sin(cr));
      // cy = (cx * Math.sin(cr)) + (cy * Math.cos(cr));

      cx = cx + character.position.x;
      cy = cy + character.position.y;

      cx = x - (cw / 2);
      cy = y - (ch / 2);

      //innocent until proven guilty
      for(z in map)
      {
        mw = map[z].size.w;
        mh = map[z].size.h;
        mx = map[z].position.x - (mw / 2);
        my = map[z].position.y - (mh / 2);

        if(cx < mx + mw && cx + cw > mx && cy < my + mh && cy + ch > my)
          return false;
      }

      if(axis == 'rz')
        enableResetOrientation = true;

      character.position.x = parseFloat(character.position.x.toFixed(movePercision));
      character.position.y = parseFloat(character.position.y.toFixed(movePercision));

      return true;
    }
    else
    {
      return false;
    }
  }
})();
