let eventBus = new Vue();
const STORAGE_KEY = 'product-reviews';
const storage = {
    save(reviews) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
            console.log('Отзывы сохранены:', reviews);
        } catch (e) {
            console.error('Ошибка сохранения:', e);
        }
    },
    load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const reviews = JSON.parse(saved);
                console.log('Отзывы загружены:', reviews);
                return reviews;
            }
        } catch (e) {
            console.error('Ошибка загрузки:', e);
        }
        return [];
    }
};

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
                    recommend: this.recommend,
                    date: new Date().toLocaleString()
                }
                
                eventBus.$emit('review-submitted', productReview);
                
                this.name = null;
                this.review = null;
                this.rating = null;
                this.recommend = null;
            }
        }
    }
});

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        },
        details: {
            type: Array,
            required: true
        },
        shipping: {
            type: String,
            required: true
        }
    },
    template: `
        <div class="tabs-container">
            <ul class="tab-headers">
                <span 
                    class="tab" 
                    v-for="(tab, index) in tabs" 
                    :key="index"
                    :class="{ activeTab: selectedTab === tab }"
                    @click="selectedTab = tab"
                >{{ tab }}</span>
            </ul>
            
            <div v-show="selectedTab === 'Reviews'" class="tab-content">
                
                
                <p v-if="!reviews.length">There are no reviews yet.</p>
                <ul v-else class="reviews-list">
                    <li v-for="review in reviews" :key="review.name + review.rating + review.date">
                        <p><strong>{{ review.name }}</strong> 
                           <span class="review-date">{{ review.date }}</span>
                        </p>
                        <p>Rating: {{ review.rating }}/5</p>
                        <p>Recommend: {{ review.recommend === 'yes' ? 'Yes' : 'No' }}</p>
                        <p>{{ review.review }}</p>
                        <hr>
                    </li>
                </ul>
            </div>

            <div v-show="selectedTab === 'Make a Review'" class="tab-content">
                <product-review></product-review>
            </div>
            
            <div v-show="selectedTab === 'Details'" class="tab-content">
                <h3>Product Details</h3>
                <product-details :details="details"></product-details>
                <p><strong>Available Sizes:</strong></p>
                <ul>
                    <li v-for="size in sizes" :key="size">{{ size }}</li>
                </ul>
           
            </div>
            <div v-show="selectedTab === 'Shipping'" class="tab-content">
                <h3>Shipping Information</h3>
                <p>Shipping cost: <strong>{{ shipping }}</strong></p>
                <p>Free shipping for premium members!</p>
                <p>Standard delivery: 3-5 business days</p>
                <p>Express delivery: 1-2 business days (+$5.99)</p>
            </div>
        </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Details', 'Shipping'],
            selectedTab: 'Reviews',
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] 
        }
    },
    methods: {
        clearAllReviews() {
            if (confirm('Удалить все отзывы?')) {
                this.$emit('clear-reviews');
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

                <h3>Colors:</h3>
                <div
                    class="color-box"
                    v-for="(variant, index) in variants"
                    :key="variant.variantId"
                    :style="{ backgroundColor: variant.variantColor }"
                    @mouseover="updateProduct(index)"
                ></div>
                
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
                
                <product-tabs 
                    :reviews="reviews" 
                    :details="details"
                    :shipping="shipping"
                    @clear-reviews="clearAllReviews">
                </product-tabs>
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
        loadReviews() {
            this.reviews = storage.load();
        },
        saveReviews() {
            storage.save(this.reviews);
        },
        clearAllReviews() {
            this.reviews = [];
            this.saveReviews();
            console.log('Все отзывы удалены');
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
                return "2.99";
            }
        }
    },
    
    created() {
        this.loadReviews();
    },
    
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview);
            this.saveReviews(); 
            console.log('Добавлен отзыв:', productReview);
        });
    },
    watch: {
        reviews: {
            handler() {
                this.saveReviews();
            },
            deep: true 
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
    },
    watch: {
        cart: {
            handler(newCart) {
                localStorage.setItem('cart', JSON.stringify(newCart));
            },
            deep: true
        }
    },
    
    created() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }
});