function Vector(x, y, z) {
    if (x.x && x.y) {
        this.x = x.x;
        this.y = x.y;
        this.z = x.z || 0;
    } else {
        this.x = x;
        this.y = y;
        this.z = z || 0;
    }
}

Vector.prototype.add = function(other) {
    return new Vector(this.x+other.x, this.y+other.y, this.z+other.z);
}
Vector.prototype.sub = function(other) {
    return new Vector(this.x-other.x, this.y-other.y, this.z-other.z);
}
Vector.prototype.dot = function(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
};
Vector.prototype.lengthSq = function() {
    return this.x*this.x + this.y*this.y +  this.z*this.z
}
Vector.prototype.length = function() {
    return Math.sqrt(this.lengthSq());
}
Vector.prototype.normalise = function() {
    const length = this.length();
    return new Vector(this.x/length, this.y/length, this.z/length);
}