import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DebtPage } from './debt.page';

describe('DebtPage', () => {
  let component: DebtPage;
  let fixture: ComponentFixture<DebtPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DebtPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DebtPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
