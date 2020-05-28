import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GoalDetailPage } from './goal-detail.page';

describe('GoalDetailPage', () => {
  let component: GoalDetailPage;
  let fixture: ComponentFixture<GoalDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoalDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GoalDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
