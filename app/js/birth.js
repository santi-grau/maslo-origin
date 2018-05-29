
window.Gsap = require('gsap');
window.THREE = require('three');

var Ring = require('./Ring');

var Maslo = function( ){
	this.node = document.getElementById( 'main' );
	this.group = new THREE.Object3D();
	this.time = 0;
	this.timeStep = 0.01;

	this.scene = new THREE.Scene();
	this.ringsActive = 0;
	this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	this.camera.position.z = 1000;

	document.addEventListener('mousedown', this.click.bind(this));

	// Three scene
	this.renderer = new THREE.WebGLRenderer( { alpha : true, antialias : true } );
	this.node.appendChild( this.renderer.domElement );

	
	
	this.modifierTime = 0;
	this.modifierTimestep = 0.04;

	this.rings = [];
	for( var i = 0 ; i < 8 ; i++ ){
		var ring = new Ring( i );
		// ring.mesh.visible = false;
		this.rings.push( ring );
		this.rings[i].opacity = 0;
		this.group.add( ring.mesh );
		// TweenMax.to(ring , 2, { gaussIt : 0.98, weightIn : 1, intensity : 0.21, osc : 0.06, ease: Power4.easeOut, onComplete : this.introReady.bind( this ) } );
	}

	for( var i = 0 ; i < 8 ; i++ ) this.rings[i].setColor( [0.8,0.8,0.8], [0.8,0.8,0.8] );

	window.addEventListener( 'resize', this.resize.bind( this ) )
	this.scene.add( this.group );

	this.resize();
	this.step( 0 );
}

Maslo.prototype.click = function(){
	if( this.ringsActive == this.rings.length ) return;
	var id = this.ringsActive;
	this.group.children[ id ].visible = true;
	this.rings[ id ].opacity = 0;
	// this.rings[ 0 ].theta = 3 * this.rings[ 0 ].seed.z;
	var startScale =  1 - ( id + 2 ) * 0.1;
	Gsap.TweenMax.fromTo( this.group.children[ id ].scale , 2.3, { x : startScale, y: startScale }, {  x : 1 , y: 1, ease : Elastic.easeOut.config(1, 0.3)  } );
	
	Gsap.TweenMax.to( this.rings[ id ] , .9, { opacity : 1 } )
	
	Gsap.TweenMax.to( this.group.children[ id ] , 2, { theta : id * 0.01, delay : 0.8, ease: Elastic.easeOut.config(1, 0.6) });
	Gsap.TweenMax.to( this.rings[ id ] , 2, {
		gaussIt : 0.98,
		weightIn : 1,
		intensity : 0.21,
		osc : 0.06, delay : 0.8, ease: Power4.easeOut
	} );


	var tl1 = new TimelineMax(  );
	tl1.to( this.rings[id], 0.1, { 
		theta : 1
	} )
	.to( this.rings[id], 1.2, { 
		theta : id * 0.01,
	} )

	this.ringsActive++;
}

Maslo.prototype.introReady = function( ){
	
}

Maslo.prototype.resize = function( ){
	var width = this.node.offsetWidth, height = this.node.offsetHeight;
	for( var i = 0 ; i < 8 ; i++ ) this.rings[i].setRadius( width, height );

	this.renderer.setSize( width * 2, height * 2 );
	this.renderer.domElement.setAttribute( 'style', 'width:' + width + 'px; height:' + height + 'px;' );
}

Maslo.prototype.step = function( time ){
	window.requestAnimationFrame( this.step.bind( this ) );
	this.time += this.timeStep;

	for( var i = 0 ; i < this.rings.length ; i++ ) this.rings[i].step( this.time, i, ( i > 0 ) ? this.rings[ i - 1 ].ps : null );

	this.renderer.render( this.scene, this.camera );
}

window._root_ = new Maslo();