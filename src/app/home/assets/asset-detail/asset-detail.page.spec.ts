import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AssetDetailPage } from './asset-detail.page';

describe('AssetDetailPage', () => {
  let component: AssetDetailPage;
  let fixture: ComponentFixture<AssetDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AssetDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
