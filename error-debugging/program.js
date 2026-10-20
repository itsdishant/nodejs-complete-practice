function calculateArea(width, height) {
  return width * height;
}

let width = 10,
  height = 5;

const area = calculateArea(width, height);

if (area > 100) {
  console.log("The area is large.");
} else {
  console.log("The area is small.");
}

if (area >= 100) {
  console.log("Area is greater than or equal to 100");
}

module.exports = calculateArea;
