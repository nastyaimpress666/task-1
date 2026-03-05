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

Vue.component('product', {
    template: `
        <div class="product">
            <div class="product-image">
                <img :src="image" :alt="altText">
            </div>

            <div class="product-info">
                <p class="sale-message">{{ sale }}</p>
                <h1>{{ title }}</h1>

                <div class="cart">
                    <p>Cart({{ cart }})</p>
                </div>

                <p v-if="inStock">In Stock</p>
                <p v-else :class="{ outOfStock: !inStock }">Out of Stock</p>
                
                <p>Shipping: {{ shipping }}</p>

                <h3>Details:</h3>
                <!-- ИСПОЛЬЗУЕМ КОМПОНЕНТ product-details -->
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

                <button @click="removeFromCart" :disabled="cart === 0">
                    Remove from cart
                </button>

                <a :href="link">More products like this</a>
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
            cart: 0,
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
            selectedVariant: 0
        }
    },
    
    methods: {
        addToCart() {
            this.cart += 1
        },
        updateProduct(index) {
            this.selectedVariant = index;
        },
        removeFromCart() {
            if (this.cart > 0) {
                this.cart -= 1;
            }
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
        premium: true 
    }
});