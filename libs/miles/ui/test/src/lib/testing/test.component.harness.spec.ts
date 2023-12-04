import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsMilesTestComponent } from '../test.component';

import { AsMilesTestHarness } from './test.component.harness';

@Component({
  template: '<as-miles-test></as-miles-test>',
})
class TestHostComponent {}

describe('AsMilesTestHarness', () => {
  let fixture: ComponentFixture<AsMilesTestComponent>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [AsMilesTestComponent],
    });

    fixture = TestBed.createComponent(AsMilesTestComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(await loader.getHarnessOrNull(AsMilesTestHarness)).toBeInstanceOf(
      AsMilesTestHarness
    );
  });

  it('should return the correct title', async () => {
    const harness = await loader.getHarness(AsMilesTestHarness);

    expect(await harness.getTitle()).toEqual('John');
  });
});
