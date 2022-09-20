export class Global {
  private now = Date.now();
  private deltaTime = 0;
  private mspf: number[] = [];
  private averageMSPF = 0;

  private static mspfAverage = 20;

  public delta() {
    const now = Date.now();
    this.deltaTime = now - this.now;
    this.now = now;
    this.mspf.push(this.deltaTime);
    if (this.mspf.length > Global.mspfAverage) {
      this.mspf.slice(0, Global.mspfAverage);
    }
    return this.deltaTime / 1000;
  }

  public fps() {
    this.averageMSPF = this.mspf.reduce((a, b) => a + b, 0);
    this.averageMSPF /= this.mspf.length;
    return 1000 / this.averageMSPF;
  }
}