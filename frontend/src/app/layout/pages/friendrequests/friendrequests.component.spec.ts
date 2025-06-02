import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendRequestsComponent } from './friendrequests.component';

describe('FriendrequestsComponent', () => {
  let component: FriendRequestsComponent;
  let fixture: ComponentFixture<FriendRequestsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FriendRequestsComponent]
    });
    fixture = TestBed.createComponent(FriendRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
