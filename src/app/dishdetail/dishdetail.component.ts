import { Component, OnInit, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
import { ProcessHTTPMsgService } from '../services/process-httpmsg.service';
import { visibility, flyInOut, expand } from '../animations/app.animation';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
   '[@flyInOut]': 'true',
   'style': 'display: block;'
  },
  animations: [
    visibility(),
    flyInOut(),
    expand()
  ]
})
export class DishdetailComponent implements OnInit {
    
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  errMess: string;
  dishFeedbackForm: FormGroup;
  validFeedbackComment: Comment;
  dishcopy: Dish;
  visibility = 'shown';

  formErrors = {
    'author': '',
    'rating': '',
    'comment': ''
  };

  validationMessages = {
      'author': {
          'required': 'Author Name is required.',
          'minlength': 'Author Name must be at least 2 characters long.'
      },
      'comment': {
          'required': 'Comment is required.'
      },
  };

  constructor(private dishService: DishService, private route: ActivatedRoute, 
              private location: Location, private fb: FormBuilder, @Inject('BaseURL') private BaseURL,
              private processHTTPMsgService: ProcessHTTPMsgService) { 
                this.createDishFeedbackForm();
              }

  ngOnInit() {
    this.dishService.getDishIds()
      .subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => {
      this.visibility = 'hidden'; 
      return this.dishService.getDish(params['id']);
    } ))
    .subscribe(dish => { 
      this.dish = dish; 
      this.dishcopy = dish; 
      this.setPrevNext(dish.id); 
      this.visibility = 'shown';
    },
      errmess => this.errMess = <any>errmess);
  }

  createDishFeedbackForm() {
    this.dishFeedbackForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)] ],
      rating: 5,
      comment: ['', Validators.required]
    });
    this.dishFeedbackForm.valueChanges
      .subscribe(data => this.onDetailChanged(data));
    this.onDetailChanged();
  }

  onDetailChanged(data?: any) {
    if (!this.dishFeedbackForm) { return; }
    const form = this.dishFeedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  goBack(): void {
    this.location.back();
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  onFeedbackSubmit() {
    this.validFeedbackComment = this.dishFeedbackForm.value;
    this.validFeedbackComment['date'] = new Date().toISOString();
    this.dishcopy.comments.push(this.validFeedbackComment);
    this.dishService.putDish(this.dishcopy).subscribe(dish => {
      this.dish = dish;
      this.dishcopy = dish;
    },
    errmess => {
      this.dish = null;
      this.dishcopy = null;
      this.errMess = <any>errmess;
    });
    this.dishFeedbackForm.reset({
      author: '',
      rating: 5,
      comment: ''
    });
  }
}
