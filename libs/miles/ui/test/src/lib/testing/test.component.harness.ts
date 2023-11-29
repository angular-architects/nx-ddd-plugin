import { ContentContainerComponentHarness } from '@angular/cdk/testing';

export class AsMilesTestHarness extends ContentContainerComponentHarness {
  public static readonly hostSelector = 'as-miles-test';

  /**
   * The title of the Test
   */
  private readonly _title = this.locatorFor('h1')();

  /**
   * Gets the title of the Test
   */
  public async getTitle(): Promise<string | null> {
    return (await (await this._title).text()) ?? null;
  }
}
