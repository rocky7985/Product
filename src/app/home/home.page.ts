import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/common.service';
import { IonPopover } from '@ionic/angular';
import { InfiniteScrollCustomEvent } from '@ionic/angular';



@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  @ViewChild(IonPopover) popover!: IonPopover;

  products: any[] = [];
  productPairs: any[] = [];
  isOpen: boolean = false;
  popoverDescription = '';
  offset = 0;
  limit = 10;
  hasMoreItems = true;
  cartCount: any = [];
  updatedCount: any = '';

  constructor(
    private router: Router,
    public CommonService: CommonService,
  ) { }

  ionViewWillEnter() {
    this.getdata();
    this.getCartCount();
  }

  getdata() {
    // const sendData ={offset:this.offset,limit:this.limit};
    this.CommonService.getProducts(this.offset, this.limit).subscribe({
      next: (data: any) => {
        this.products = [...this.products, ...data];
        this.groupProductsIntoPairs();
        console.log('products', this.products);
      },

      error: (error: any) => {
        console.error('Error fetching products', error)
      }
    });
  }

  loadMoreItems(event: InfiniteScrollCustomEvent) {
    this.offset++;
    if (this.products.length != 20) {
      this.CommonService.getProducts(this.offset, this.limit).subscribe({
        next: (data: any) => {
          this.products = [...this.products, ...data];
          this.groupProductsIntoPairs();
          console.log('products', this.products);

          if (data.length < this.limit) {
            this.hasMoreItems = false;
          }
          event.target.complete();
        },

        error: (error: any) => {
          console.error('Error fetching products', error)
          event.target.complete();

        }
      });
    } else {
      event.target.complete();
    }
  }

  groupProductsIntoPairs() {
    this.productPairs = [];
    for (let i = 0; i < this.products.length; i += 2) {
      this.productPairs.push(this.products.slice(i, i + 2));
    }
  };

  presentPopover(event: Event, description: string) {
    this.popover.event = event;
    this.popoverDescription = description;
    this.isOpen = true;
  }

  logout() {
    localStorage.removeItem('login');
    this.router.navigate(['/login']);
    console.log("Logout clicked");
  }

  rateCount(rating: number): string[] {
    const fillrate = Math.round(rating);
    const fullstars = Array(fillrate).fill('star');
    const emptystars = Array(5 - fillrate).fill('star-outline');
    return [...fullstars, ...emptystars];
  }

  addtoCart(item: any) {
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    console.log('firstcount', cartItems)
    const loggedInUser = JSON.parse(localStorage.getItem('login') || '[]');
    item.email = loggedInUser.email;
    const existingItems = cartItems.find((c: any) => c.id == item.id && c.email == item.email)
    if (existingItems) {
      existingItems.quantity++;
      this.checkandadd(existingItems, cartItems);

    }
    else {
      item.quantity = 1;
      cartItems.push(item);
      this.checkandadd(item, cartItems);

    }

  }

  isInCart(item: any): boolean {
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const loggedInUser = JSON.parse(localStorage.getItem('login') || '[]');

    return cartItems.some((cartItem: any) => cartItem.id === item.id && cartItem.email == loggedInUser.email)
  }

  getCartCount(): number {
    const cartCounted = JSON.parse(localStorage.getItem('cart') || '[]');
    const loginUser = JSON.parse(localStorage.getItem('login') || '[]');
    this.cartCount = cartCounted.filter((i: any) => i.email == loginUser.email)
    return this.cartCount.length;
  }

  //   assignQuantWise(){
  //     const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');

  //     this.CommonService.getProducts(this.offset,this.limit).subscribe({
  //       next:(q:any)=>{
  //         cartItems.forEach((p:any)=>{
  //           const productQuantity= q.find((u:any)=> u.id == p.id);
  //           if(productQuantity){
  // p.quantity <= productQuantity.count;
  //           }
  //         });
  //         // this.groupProductsIntoPairs();
  //       },
  //       error: (error: any) => {
  //         console.error('Error fetching product quantities', error);
  //       }
  //     });

  //   }

  checkandadd(existingItems: any, cartItems: any[]) {
    console.log('existingItems', existingItems)

    this.assignQuantWise().subscribe({
      next: (q: any) => {
        console.log('response', q)
        const productQuantity = q.find((u: any) => u.id == existingItems.id);
        console.log('productQuantity', productQuantity)


        if (productQuantity) {
          const quantityInCart = cartItems.filter((cartItem: any) => cartItem.id === existingItems.id)
          // const totalQuantityInCart = quantityInCart.reduce((sum, currentItem) => sum + currentItem.quantity, 0);
          let totalQuantityInCart = 0;
          totalQuantityInCart += quantityInCart.length;

          const availableStock = productQuantity.rating.count - totalQuantityInCart;

          if (existingItems.quantity <= availableStock) {

            localStorage.setItem('cart', JSON.stringify(cartItems));
            console.log('cartcount', cartItems);
            this.getCartCount();
            this.updatedCount = availableStock;
            console.log('updated', this.updatedCount);
            // this.CommonService.setUpdatedCount(this.updatedCount);
            this.CommonService.setUpdatedCount(existingItems.id, this.updatedCount);

          }

          else {
            console.log('Insufficient Stock for given Id:', existingItems.id);
            this.CommonService.presentToast('Insufficient Stock');
          }
        }
      },

    });
  }

  assignQuantWise() {
    return this.CommonService.getProducts(this.offset, this.limit);

  }


}



