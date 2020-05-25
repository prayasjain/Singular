import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CashflowsPage } from './cashflows.page';

describe('CashflowsPage', () => {
  let component: CashflowsPage;
  let fixture: ComponentFixture<CashflowsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashflowsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CashflowsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
