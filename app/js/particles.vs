attribute vec4 lookup; // x, y, w, h
attribute vec4 transform; // xoffset, yoffset, rotation, null
attribute vec4 seeds; // random, random, random, random

uniform sampler2D fontTexture;
uniform vec3 dimensions; // base, padding-left, padding-bottom
uniform vec4 oscillation; // minV, maxV, minR, maxR
uniform vec4 pointSize; // minV, maxV, minR, maxR
uniform vec4 dispersion; // minV, maxV, minR, maxR
uniform vec4 settings; // time, scale, weight, null

varying vec4 vColor;
varying float vPointSize;

#define M_PI 3.1415926535897932384626433832795

// Description : Array and textureless GLSL 2D simplex noise function. Author : Ian McEwan, Ashima Arts. Maintainer : stegu Lastmod : 20110822 (ijm)
// License : Copyright (C) 2011 Ashima Arts. All rights reserved. Distributed under the MIT License. See LICENSE file. https://github.com/ashima/webgl-noise https://github.com/stegu/webgl-noise

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v){
	const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
	vec2 i  = floor(v + dot(v, C.yy) );
	vec2 x0 = v -   i + dot(i, C.xx);
	vec2 i1;
	i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
	vec4 x12 = x0.xyxy + C.xxzz;
	x12.xy -= i1;
	i = mod289(i); // Avoid truncation effects in permutation
	vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
	vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
	m = m*m ;
	m = m*m ;
	vec3 x = 2.0 * fract(p * C.www) - 1.0;
	vec3 h = abs(x) - 0.5;
	vec3 ox = floor(x + 0.5);
	vec3 a0 = x - ox;
	m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
	vec3 g;
	g.x  = a0.x  * x0.x  + h.x  * x0.y;
	g.yz = a0.yz * x12.xz + h.yz * x12.yw;
	return 130.0 * dot(m, g);
}

float map( vec4 v, float m ){
	float minV = v.x;
	float maxV = v.y;
	float minR = v.z;
	float maxR = v.w;
	float range = maxR - minR;

	return minR + ( minV * range ) + ( ( maxV * range ) - ( minV * range ) ) * m;
}

void main() {
	// time
	float time = settings.x;

	// p -> positions
	vec3 p = vec3( position.xy, position.z );

	// vColor
	vColor = vec4( seeds.x, seeds.y, seeds.z, seeds.w );

	// dispersion
	float dNoise = snoise( vec2( seeds.x, seeds.y ) ) ;
	float dVal = map( dispersion, dNoise );
	float dx = cos( M_PI * 2.0 * transform.z ) * dVal;
	float dy = sin( M_PI * 2.0 * transform.z ) * dVal;
	p.xy += vec2( dx, dy );

	// oscillation
	float oNoise = snoise( vec2( seeds.z, seeds.w ) ) ;
	float ox = map( oscillation, oNoise ) * snoise( vec2( position.x * 100.0, time ) );
	float oy = map( oscillation, oNoise ) * snoise( vec2( position.y * 100.0, time ) );
	p.xy += vec2( ox, oy );

	// pointSize
	float pNoise = ( snoise( vec2( position.x / 0.01, position.y / 0.01 ) ) + 1.0 ) / 2.0;
	vPointSize = map( pointSize, pNoise );

	gl_PointSize = 30.0;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );
}