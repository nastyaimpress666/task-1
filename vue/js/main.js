let eventBus = new Vue()
Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
        <ul>
            <li v-for="detail in details">{{ detail }}</li>
        </ul>
    `
});

Vue.component('product-review', {
    template: `
        <form class="review-form" @submit.prevent="onSubmit">
            <p v-if="errors.length">
                <b>Please correct the following error(s):</b>
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
                </ul>
            </p>
            
            <p>
                <label for="name">Name:</label>
                <input id="name" v-model="name" placeholder="name">
            </p>

            <p>
                <label for="review">Review:</label>
                <textarea id="review" v-model="review"></textarea>
            </p>

            <p>
                <label for="rating">Rating:</label>
                <select id="rating" v-model.number="rating">
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                </select>
            </p>
            
            <p>
                <label>Would you recommend this product?</label><br>
                <input 
                    type="radio" 
                    id="yes" 
                    value="yes" 
                    v-model="recommend">
                <label for="yes">Yes</label>
                
                <input 
                    type="radio" 
                    id="no" 
                    value="no" 
                    v-model="recommend">
                <label for="no">No</label>
            </p>

            <p>
                <input type="submit" value="Submit"> 
            </p>
        </form>
    `,
    
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,  
            errors: []         
        }
    },
    
    methods: {
        onSubmit() {
            this.errors = [];
            if(!this.name) this.errors.push("Name required.");
            if(!this.review) this.errors.push("Review required.");
            if(!this.rating) this.errors.push("Rating required.");
            if(!this.recommend) this.errors.push("Recommendation required."); 
            if(!this.errors.length) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend  
                }

                this.$emit('review-submitted', productReview);
                this.name = null;
                this.review = null;
                this.rating = null;
                this.recommend = null;
            }
        }
    }
});

Vue.component('product', {
    template: `
        <div class="product">
            <div class="product-image">
                <img :src="image" :alt="altText">
            </div>

            <div class="product-info">
                <p class="sale-message">{{ sale }}</p>
                <h1>{{ title }}</h1>
                
                <p v-if="inStock">In Stock</p>
                <p v-else :class="{ outOfStock: !inStock }">Out of Stock</p>
                
                <p>Shipping: {{ shipping }}</p>

                <h3>Details:</h3>
                <product-details :details="details"></product-details>
                
                <h3>Colors:</h3>
                <div
                    class="color-box"
                    v-for="(variant, index) in variants"
                    :key="variant.variantId"
                    :style="{ backgroundColor: variant.variantColor }"
                    @mouseover="updateProduct(index)"
                ></div>

                <h3>Available Sizes:</h3>
                <ul>
                    <li v-for="size in sizes" :key="size">{{ size }}</li>
                </ul>
                
                <button
                    @click="addToCart"
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }"
                >
                    Add to cart
                </button>

                <button 
                    @click="removeFromCart" 
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }"
                >
                    Remove from cart
                </button>

                <a :href="link">More products like this</a>
                <div class="reviews">
                    <h2>Reviews</h2>
                    <p v-if="!reviews.length">There are no reviews yet.</p>
                    <ul>
                        <li v-for="review in reviews" :key="review.name + review.rating">
                            <p><strong>{{ review.name }}</strong></p>
                            <p>Rating: {{ review.rating }}/5</p>
                            <p>Recommend: {{ review.recommend === 'yes' ? 'Yes' : 'No' }}</p>
                            <p>{{ review.review }}</p>
                            <hr>
                        </li>
                    </ul>
                </div>
                <product-review @review-submitted="addReview"></product-review>
            </div>
        </div>
    `,
    
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            altText: "A pair of socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            onSale: true,
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0
                }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            selectedVariant: 0,
            reviews: []  
        }
    },
    
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        
        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
        },
        
        updateProduct(index) {
            this.selectedVariant = index;
        },
        
        addReview(productReview) {
            this.reviews.push(productReview);
            console.log('Добавлен отзыв:', productReview);
        }
    },

    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity > 0;
        },
        sale() {
            if (this.onSale) {
                return this.brand + ' ' + this.product + ' are on sale!';
            } else {
                return this.brand + ' ' + this.product + ' are not on sale';
            }
        },  
        
        shipping() {  
            if (this.premium) {
                return "Free";
            } else {
                return 2.99;
            }
        }
    }
});

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []  
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
            console.log('Добавлен товар с id:', id, 'Корзина:', this.cart);
        },
        
        removeFromCart(id) {
            const index = this.cart.indexOf(id);
            if (index !== -1) {
                this.cart.splice(index, 1);
                console.log('Удален товар с id:', id, 'Корзина:', this.cart);
            }
        }
    }
});