import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AssetsPage } from './assets.page';

describe('AssetsPage', () => {
  let component: AssetsPage;
  let fixture: ComponentFixture<AssetsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AssetsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
