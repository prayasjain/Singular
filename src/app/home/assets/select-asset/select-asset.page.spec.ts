import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectAssetPage } from './select-asset.page';

describe('SelectAssetPage', () => {
  let component: SelectAssetPage;
  let fixture: ComponentFixture<SelectAssetPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectAssetPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectAssetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
