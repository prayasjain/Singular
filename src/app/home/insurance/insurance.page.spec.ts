import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InsurancePage } from './insurance.page';

describe('InsurancePage', () => {
  let component: InsurancePage;
  let fixture: ComponentFixture<InsurancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsurancePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InsurancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
