import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AssetItemPagePage } from './asset-item-page.page';

describe('AssetItemPagePage', () => {
  let component: AssetItemPagePage;
  let fixture: ComponentFixture<AssetItemPagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetItemPagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AssetItemPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
