uniform vec3 color;
uniform sampler2D pointTexture;
uniform vec4 settings; // time, scale, weight, null

varying vec4 vColor;
varying float vPointSize;

void main() {
	vec3 col = vColor.xyz;
	float alpha = 0.0;
	if( vColor.a > 0.3 + ( 1.0 - settings.z ) * 0.4 ) alpha = 1.0;

	float dots = 15.0;

	float width = (gl_PointCoord.x / dots);
	float height = (gl_PointCoord.y );
	float x = floor( vPointSize - 1.0 ) / dots;
	float y = 0.0;

	gl_FragColor = vec4( color, alpha ) * texture2D( pointTexture, vec2( x + width, y + height ) );
}