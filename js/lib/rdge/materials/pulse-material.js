/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Material = require("js/lib/rdge/materials/material").Material;
var Texture = require("js/lib/rdge/texture").Texture;

///////////////////////////////////////////////////////////////////////
// Class GLMaterial
//      RDGE representation of a material.
///////////////////////////////////////////////////////////////////////
var PulseMaterial = function PulseMaterial()
{
	var MaterialLibrary = require("js/models/materials-model").MaterialsModel;

   // initialize the inherited members
	this.inheritedFrom = Material;
	this.inheritedFrom();
   
	///////////////////////////////////////////////////////////////////////
	// Instance variables
	///////////////////////////////////////////////////////////////////////
	this._name = "PulseMaterial";
	this._shaderName = "pulse";

	this._texMap = 'assets/images/cubelight.png';

	this._time = 0.0;
	this._dTime = 0.01;

	this._xScale = 0.5;
	this._yScale = 0.4;
	this._speed  = 1.0;

	///////////////////////////////////////////////////////////////////////
	// Property Accessors
	///////////////////////////////////////////////////////////////////////
	this.getName		= function()	{ return this._name;			};
	this.getShaderName	= function()	{  return this._shaderName;		};

	this.getTextureMap			= function()		{  return this._propValues[this._propNames[0]] ? this._propValues[this._propNames[0]].slice() : null	};
	this.setTextureMap			= function(m)		{  this._propValues[this._propNames[0]] = m ? m.slice(0) : null;  this.updateTexture();  	};

	this.isAnimated			= function()			{  return true;					};

	///////////////////////////////////////////////////////////////////////
	// Material Property Accessors
	///////////////////////////////////////////////////////////////////////
	this._propNames			= ["texmap",		"xscale",		"yscale",		"speed" ];
	this._propLabels		= ["Texture map",	"X Range",		"Y Range",		"Speed" ];
	this._propTypes			= ["file",			"float",		"float",		"float"];
	this._propValues		= [];

	this._propValues[ this._propNames[0] ] = this._texMap.slice(0);
	this._propValues[ this._propNames[1] ] = this._xScale;
	this._propValues[ this._propNames[2] ] = this._yScale;
	this._propValues[ this._propNames[3] ] = this._speed;

	this.setProperty = function( prop, value ) {
		// make sure we have legitimate imput
		var ok = this.validateProperty( prop, value );
		if (!ok) {
			console.log( "invalid property in Radial Gradient Material:" + prop + " : " + value );
		}

		switch (prop)
		{
			case "texmap":
				this.setTextureMap(value);
				break;

			case "speed":
				this._speed = value;
				this._propValues[ this._propNames[3] ] = this._speed;
				this.updateParameters();
				break;

			case "xscale":
				this._xScale = value;
				this._propValues[ this._propNames[1] ] = this._xScale;
				this.updateParameters();
				break;

			case "yscale":
				this._yScale = value;
				this._propValues[ this._propNames[2] ] = this._yScale;
				this.updateParameters();
				break;

			case "color":
				break;
		}
	};
	///////////////////////////////////////////////////////////////////////


	///////////////////////////////////////////////////////////////////////
	// Methods
	///////////////////////////////////////////////////////////////////////
	// duplicate method required
	this.dup = function( world ) {
		// save the world
		if (world)  this.setWorld( world );

		// get the current values;
		var propNames = [], propValues = [], propTypes = [], propLabels = [];
		this.getAllProperties(propNames, propValues, propTypes, propLabels);
		
		// allocate a new material
		var newMat = new PulseMaterial();

		// copy over the current values;
		var n = propNames.length;
		for (var i = 0; i < n; i++)
			newMat.setProperty(propNames[i], propValues[i]);

		return newMat;
	};

	this.init = function( world ) {
		// save the world
		if (world)  this.setWorld( world );

		// this variable declared above is inherited set to a smaller delta.
		// the pulse material runs a little faster
		this._dTime = 0.01;

		// set up the shader
		this._shader = new RDGE.jshader();
		this._shader.def = pulseMaterialDef;
		this._shader.init();

		// set up the material node
		this._materialNode = RDGE.createMaterialNode("pulseMaterial" + "_" + world.generateUniqueNodeID());
		this._materialNode.setShader(this._shader);

		this._time = 0;
		if (this._shader && this._shader['default']) {
			this._shader['default'].u_time.set( [this._time] );
		}
		this.updateParameters();

		// set up the texture
		var texMapName = this._propValues[this._propNames[0]];
		this._glTex = new Texture( world, texMapName );

		// set the shader values in the shader
		this.updateTexture();
		this.setResolution( [world.getViewportWidth(),world.getViewportHeight()] );
		this.update( 0 );
	};

	this.updateParameters = function()
	{
		this._propValues[ this._propNames[1] ] = this._xScale;
		this._propValues[ this._propNames[2] ] = this._yScale;
		this._propValues[ this._propNames[3] ] = this._speed;

		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram['default'];
			var renderer = RDGE.globals.engine.getContext().renderer;
			if (renderer && technique)
			{

				if (this._shader && this._shader['default']) {
					this._shader['default'].u_speed.set( [this._speed] );
					this._shader['default'].u_xscale.set( [this._xScale] );
					this._shader['default'].u_yscale.set( [this._yScale] );
				}
			}
		}
	}

	this.updateTexture = function() {
		
		var texMapName = this._propValues[this._propNames[0]];
		this._glTex = new Texture( this.getWorld(), texMapName );

		var material = this._materialNode;
		if (material) {
			var technique = material.shaderProgram['default'];
			var renderer = RDGE.globals.engine.getContext().renderer;
			if (renderer && technique) {
				var wrap = 'REPEAT',  mips = true;
				var tex;
				if (this._glTex)
				{
					if (this._glTex.isAnimated())
						this._glTex.render();
					tex = this._glTex.getTexture();
				}
				
				if (tex) {
					technique.u_tex0.set( tex );
				}
			}
		}
	};

	this.update = function( time )
	{
		var material = this._materialNode;
		if (material)
		{
			var technique = material.shaderProgram['default'];
			var renderer = RDGE.globals.engine.getContext().renderer;
			if (renderer && technique)
			{
				if (this._glTex)
				{
					//this.updateTexture();
					if (this._glTex.isAnimated())
						this._glTex.render();
					tex = this._glTex.getTexture();
					if (tex)
						technique.u_tex0.set( tex );
				}

				if (this._shader && this._shader['default']) {
					this._shader['default'].u_time.set( [this._time] );
				}
				this._time += this._dTime;

				if (this._time > 200.0)  this._time = 0.0;
			}
		}
	};

	this.setResolution = function( res ) {
		var material = this._materialNode;
		if (material) {
			var technique = material.shaderProgram['default'];
			var renderer = RDGE.globals.engine.getContext().renderer;
			if (renderer && technique) {
				technique.u_resolution.set( res );
			}
		}
	};

	// JSON export
	this.exportJSON = function()
	{
		var jObj =
		{
			'material'		: this.getShaderName(),
			'name'			: this.getName(),
			'texture'		: this._propValues[this._propNames[0]],
			'dTime'         : this._dTime,
			'speed'			: this._speed,
			'xScale'		: this._xScale,
			'yScale'		: this._yScale
		};

		return jObj;
	};

	this.importJSON = function( jObj ) {
		if (this.getShaderName() != jObj.material)  throw new Error( "ill-formed material" );
		this.setName(  jObj.name );

		try {
			this._propValues[this._propNames[0]] = jObj.texture;
			this._texMap = jObj.texture;
			if (jObj.dTime) {
				this._dTime = jObj.dTime;
			}

			this._speed = jObj.speed;
			this._xScale = jObj.xScale;
			this._yScale = jObj.yScale;
			this.updateParameters();
		}
		catch (e)
		{
			throw new Error( "could not import material: " + jObj );
		}
	};
};

///////////////////////////////////////////////////////////////////////////////////////
// RDGE shader
 
// shader spec (can also be loaded from a .JSON file, or constructed at runtime)
var pulseMaterialDef =
{'shaders': 
	{
		'defaultVShader':"assets/shaders/Basic.vert.glsl",
		'defaultFShader':"assets/shaders/Pulse.frag.glsl"
	},
	'techniques':
	{ 
		'default':
		[
			{
				'vshader' : 'defaultVShader',
				'fshader' : 'defaultFShader',
				// attributes
				'attributes' :
				{
					'vert'  :   { 'type' : 'vec3' },
					'normal' :  { 'type' : 'vec3' },
					'texcoord'  :   { 'type' : 'vec2' }
				},
				// parameters
				'params' : 
				{
					'u_tex0'   : { 'type' : 'tex2d' },
					'u_time'   : { 'type' : 'float' },
					'u_speed'  : { 'type' : 'float' },
					'u_xscale' : { 'type' : 'float' },
					'u_yscale' : { 'type' : 'float' },
					'u_resolution'  :   { 'type' : 'vec2' }
				},

				// render states
				'states' : 
				{
					'depthEnable' : true,
					'offset':[1.0, 0.1]
				}
			}
		]
	}
};

//PulseMaterial.prototype = new Material();

if (typeof exports === "object") {
	exports.PulseMaterial = PulseMaterial;
}

