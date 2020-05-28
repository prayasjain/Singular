import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CashflowDetailPage } from './cashflow-detail.page';

describe('CashflowDetailPage', () => {
  let component: CashflowDetailPage;
  let fixture: ComponentFixture<CashflowDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashflowDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CashflowDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
