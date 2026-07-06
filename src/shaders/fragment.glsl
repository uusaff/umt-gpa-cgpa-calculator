varying vec3 vColor;
varying float vAlpha;

void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    
    // Create soft circular edges
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
}