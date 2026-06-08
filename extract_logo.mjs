import { Jimp } from "jimp";

async function extractLogo() {
  try {
    const image = await Jimp.read('public/logo.jpg');
    
    // Convert to RGBA
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      const intensity = (red + green + blue) / 3;
      
      const newAlpha = 255 - intensity;
      
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
