import { Component, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/common.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnDestroy {

  cartItems: any[] = [];
  totalItems: number = 0;
  totalPrice: number = 0;
  updatedCounts: Map<number, number> = new Map<number, number>();
  updatedCountSubscriptions: Map<number, Subscription> = new Map<number, Subscription>();

  constructor(public CommonService: CommonService,
    private router: Router,

  ) { }

  ionViewWillEnter() {
    this.loadCartItems();

  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions when leaving the component
    this.updatedCountSubscriptions.forEach((sub:any) => sub.unsubscribe());
  }

  loadCartItems() {
    const loggedInUser = JSON.parse(localStorage.getItem('login') || '[]');
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]')
    this.cartItems = cartItems.filter((i: any) => i.email == loggedInUser.email);

    this.cartItems.forEach((item:any) => {
      const sub = this.CommonService.getUpdatedCount(item.id).subscribe((count:any) => {
        this.updatedCounts.set(item.id, count);
      });
      this.updatedCountSubscriptions.set(item.id, sub);
    });

    
    this.calculateTotalPrice();
  }

  increaseQuantity(item: any) {
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const loggedInUser = JSON.parse(localStorage.getItem('login') || '[]');

    const existItem = cartItems.find((i: any) => i.id == item.id && i.email == loggedInUser.email)
    if (existItem) {
      if (existItem.quantity < (existItem.rating?.count || 0)) {
        existItem.quantity++;
        localStorage.setItem('cart', JSON.stringify(cartItems));
        this.loadCartItems();
        this.updateProductCount(existItem);

      }
      else {
        this.CommonService.presentToast('Product Unavailable');
      }
    }

  }

  decreaseQuantity(item: any) {
    const incartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const loggedInUser = JSON.parse(localStorage.getItem('login') || '[]');
    const itemExist = incartItems.find((i: any) => i.id === item.id && i.email == loggedInUser.email)
    if (itemExist) {
      if (itemExist.quantity > 1) {
        itemExist.quantity--;
      }

      else {
        const index = incartItems.indexOf(itemExist);
        if (index > -1) {
          incartItems.splice(index, 1);
        }
      }

      localStorage.setItem('cart', JSON.stringify(incartItems));
      this.loadCartItems();
      this.updateProductCount(itemExist);


    }

  }

  updateProductCount(item:any){
    const availableStock = item.rating.count - item.quantity;
    this.CommonService.setUpdatedCount(item.id, availableStock);
  }
  

  async deleteProduct(cleardetails: any) {
    console.log('Delete details:', cleardetails)
    const alert = await this.CommonService.presentAlert('Confirm!', 'Are you sure you want to delete the product?')
    if (alert) {
      const loggedInUser = JSON.parse(localStorage.getItem('login') || '[]');
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]')
      const index = cartItems.findIndex((d: any) => d.id == cleardetails.id && d.email == loggedInUser.email)

      if (index !== -1) {
        cartItems.splice(index, 1)
        localStorage.setItem('cart', JSON.stringify(cartItems));
        this.loadCartItems();
        this.updateProductCount(cleardetails);


      }
    }
  }

  calculateTotalPrice() {

    this.totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
    this.totalPrice = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

}
