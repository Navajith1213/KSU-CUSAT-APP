import { Jimp } from "jimp";

async function extractLogo() {
  try {
    const image = await Jimp.read('public/logo.jpg');
    
    // We want to turn the dark parts of the logo WHITE, and the white parts TRANSPARENT.
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      const intensity = (red + green + blue) / 3;
      
      // If the pixel is light (JPEG artifact background), make it completely transparent
      let newAlpha = 0;
      if (intensity < 180) { // It's part of the dark logo
        // Dark pixels become opaque white
        // A black pixel (0) will have alpha 255
        // A grey pixel (100) will have alpha 155
        newAlpha = 255 - intensity;
      }
      
      this.bitmap.data[idx + 0] = 255;
      this.bitmap.data[idx + 1] = 255;
      this.bitmap.data[idx + 2] = 255;
      this.bitmap.data[idx + 3] = newAlpha;
    });

    await image.write('public/logo_white.png');
    console.log('Successfully generated public/logo_white.png');
  } catch (err) {
    console.error('Error generating logo:', err);
  }
}

extractLogo();
