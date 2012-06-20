
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform sampler2D u_tex0;

vec3 deform( in vec2 p )
{
    vec2 uv;

	float time = u_time * u_speed;
    vec2 q = vec2( sin(1.1*time+p.x),sin(1.2*time+p.y) );

    float a = atan(q.y,q.x);
    float r = sqrt(dot(q,q));

    uv.x = sin(0.0+1.0*time)+p.x*sqrt(r*r+1.0);
    uv.y = sin(0.6+1.1*time)+p.y*sqrt(r*r+1.0);

    return texture2D(u_tex0,uv*.5).xyz;
}

void main(void)
{
    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / u_resolution.xy;
    //vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / vec2(500,500).xy;
    vec2 s = p;

    vec3 total = vec3(0.0);
    vec2 d = (vec2(0.0,0.0)-p)/40.0;
    float w = 1.0;
    for( int i=0; i<40; i++ )
    {
        vec3 res = deform(s);
        res = smoothstep(0.1,1.0,res*res);
        total += w*res;
        w *= .99;
        s += d;
    }
    total /= 40.0;
    float r = 1.5/(1.0+dot(p,p));

    gl_FragColor = vec4( total*r,1.0);
}