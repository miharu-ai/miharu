interface MiharuOptions {
  // Future options can be added here
}

class Miharu {
  private initialized = false;

  init(options?: MiharuOptions): void {
    if (this.initialized) {
      return;
    }

    console.log('Hello, greeting from miharu!');
    this.initialized = true;
  }
}

const miharu = new Miharu();

export default miharu;