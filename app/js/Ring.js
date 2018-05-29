var SimplexNoise = require('simplex-noise');

var Ring = function( id ){
	THREE.Mesh.apply(this, arguments);
	this.noise = new SimplexNoise( Math.random );

	this.idle = true;
	this.theta 	= Math.random();
	this.idleRotationSpeed = ( -0.5 + Math.random() ) / 100;
	this.radius 	= 0.9 + Math.random() / 5;
	this.strokeWidth = 1;
	this.res 		= r	= 256;
	this.osc 		= Math.random()/10;
	this.intensity 	= 1.5;
	this.gaussIt 	= 0;
	this.weightIn 	= Math.random();
	this.opacity = 0.2;
	this.seed = new THREE.Vector3( Math.random(), Math.random(), Math.random() );
	this.innerColor = new THREE.Vector4( 1 - id / 8, 1 - id / 8, 1 - id / 8, 0.01 );
	this.rimColor1 = new THREE.Vector4( 0, 0, 0, 0.1 )
	this.rimColor2 = new THREE.Vector4( 0, 0, 0, 0.1 );

	this.geometry = new THREE.BufferGeometry(), positions = [], indices = [], colors = [], points = Math.round( r * 0.3 ), minDiv = 0.01;

	for( var i = 0 ; i < r * 3 + 1 ; i++ ) positions.push( 0, 0, id );
	this.geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );

	for( var i = 0 ; i < r ; i++ ) indices.push( 0, i, i+1 );
	for( var i = 0 ; i < r - 1; i++ ) indices.push( r + 1 + i, r * 2 + 1 + i, r + 2 + i, r + 2 + i, r * 2 + 1 + i, r * 2 + 2 + i );
	indices.push( 0, r, 1, r * 2, r * 3, r + 1, r  + 1, r * 3, r * 2+ 1 );
	this.geometry.setIndex( indices );

	for( var i = 0 ; i < r * 3 + 1 ; i++ ) colors.push( 0, 0, 0, 1 );
	this.geometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( colors ), 4 ) );
	
	this.gauss = [];
	for( var i = 0 ; i <= points ; i++ ) this.gauss[i] = ( Math.sin( 2 * Math.PI * ( ( i / points ) - 0.25 ) ) + 1 ) / 2 + minDiv;
	for( var i = 0 ; i < Math.round( r - points ) / 2 ; i++ ) this.gauss.unshift( minDiv );
	for( var i = this.gauss.length ; i < r ; i++ ) 	this.gauss.push( minDiv );

	this.material = new THREE.ShaderMaterial( {
		vertexShader: 'attribute vec4 color; varying vec4 vColor; void main() { vColor = color; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
		fragmentShader: 'varying vec4 vColor; void main() { vec4 color = vColor; gl_FragColor = color; }',
		transparent : true
	} );

	this.rotationGroup = new THREE.Object3D();
	this.translatoionGroup = new THREE.Object3D();

	this.rotation.z = Math.PI * 2 / 90 * id;
}

Ring.prototype = Object.create(THREE.Mesh.prototype);
Ring.prototype.constructor = Ring;

Ring.prototype.setColor = function( c0, c1 ){
	for( var i = 0 ; i < r + 1 ; i++ ) this.geometry.attributes.color.setXYZW( i, this.innerColor.x, this.innerColor.y, this.innerColor.z, this.innerColor.w );
	for( var i = r + 1 ; i < r * 2 + 1 ; i++ ) this.geometry.attributes.color.setXYZW( i, this.rimColor1.x, this.rimColor1.y, this.rimColor1.z, this.rimColor1.w );
	for( var i = r * 2 + 1 ; i < r * 3 + 1 ; i++ ) this.geometry.attributes.color.setXYZW( i, this.rimColor2.x, this.rimColor2.y, this.rimColor2.z, this.rimColor2.w );
	this.geometry.attributes.color.needsUpdate = true;
}

Ring.prototype.setRadius = function( width, height ){
	this.radius = Math.min( width, height ) * 0.4;
}

Ring.prototype.step = function( time, id, oldPoints ){

	
	this.ps = [];

	if( this.idle ){
		var alphaNoise = ( this.noise.noise2D( this.seed.x, time ) + 1 ) / 2 * 0.2;
		this.rimColor1.z = alphaNoise;
		this.rimColor2.z = alphaNoise;
		this.theta += this.idleRotationSpeed;
	}

	for( var i = 0 ; i < this.res ; i++ ){
		var vector = new THREE.Vector2( Math.cos( Math.PI * 2 * i / this.res ), Math.sin( Math.PI * 2 * i / this.res ) );

		var dim1 = ( vector.x + id / 10 ) / ( 1 / this.intensity );
		var dim2 = ( vector.y + time ) / ( 1 / 0.2 );
		var n = ( this.noise.noise2D( dim1, dim2 ) + 1 ) / 2 * this.osc;
		n *= 1 - ( (1-this.gauss[i]) * this.gaussIt );

		var pps = new THREE.Vector2( vector.x * ( 1 - n ), vector.y * ( 1 - n ) );

		if( !oldPoints ) this.ps.push(pps);
		else this.ps.push( oldPoints[i].sub( vector.clone().multiplyScalar(n) ) );
		this.ps[i] = pps.clone().add( this.ps[i].clone().sub( pps.clone() ).multiplyScalar( this.weightIn ) );

		this.geometry.attributes.position.setXY( ( i + 1 ), this.ps[i].x * ( this.radius ), this.ps[i].y * ( this.radius )	 );
		this.geometry.attributes.position.setXY( ( this.res + i + 1 ), this.ps[i].x * ( this.radius ), this.ps[i].y * ( this.radius ) );
		this.geometry.attributes.position.setXY( ( this.res * 2 + i + 1 ), this.ps[i].x * ( ( this.radius ) + this.strokeWidth ), this.ps[i].y * ( ( this.radius ) + this.strokeWidth ) );
	}

	this.rotation.z = this.theta * Math.PI * 2;
	this.geometry.attributes.position.needsUpdate = true;

	this.setColor();
}

module.exports = Ring;