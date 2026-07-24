import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Restore the Brand Section and About Section
# We find the corrupted part starting from the brand section and ending right before the Offer section
corrupted_start = html.find('<!-- Pp-Brand Section Start -->')
offer_start = html.find('<!-- Pp-Offer Section Start -->')

brand_and_about_html = """        <!-- Pp-Brand Section Start -->
        <div class="pp-brand-section section-padding pb-0 fix">
            <div class="container custom-container-3">
                <div class="brand-wrapper style-2">
                    <div class="brand-title wow fadeInUp" data-wow-delay=".3s">
                        <h3>Trusted by businesses across multiple industries.</h3>
                    </div>
                    <div class="swiper pp-brand-slider">
                        <div class="swiper-wrapper">
                            <div class="swiper-slide">
                                <div class="brand-image">
                                    <img src="assets/img/home-1/brand/01.png" alt="img">
                                </div>
                            </div>
                            <div class="swiper-slide">
                                <div class="brand-image">
                                    <img src="assets/img/home-1/brand/02.png" alt="img">
                                </div>
                            </div>
                            <div class="swiper-slide">
                                <div class="brand-image">
                                    <img src="assets/img/home-1/brand/03.png" alt="img">
                                </div>
                            </div>
                            <div class="swiper-slide">
                                <div class="brand-image">
                                    <img src="assets/img/home-1/brand/04.png" alt="img">
                                </div>
                            </div>
                            <div class="swiper-slide">
                                <div class="brand-image">
                                    <img src="assets/img/home-1/brand/05.png" alt="img">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pp-About Section Start -->
        <section class="pp-about-section section-padding pb-0 fix">
            <div class="container">
                <div class="pp-about-wrapper">
                    <div class="row g-4 align-items-center">
                        <div class="col-lg-6">
                            <div class="pp-about-image">
                                <img src="assets/img/home-1/about/about-1.jpg" alt="img" class="wow img-custom-anim-left" data-wow-duration="1.3s" data-wow-delay="0.3s">
                                <div class="pp-about-image-2">
                                    <img src="assets/img/home-1/about/about-2.jpg" alt="img" class="wow img-custom-anim-right" data-wow-duration="1.3s" data-wow-delay="0.3s">
                                </div>
                                <div class="pp-shape float-bob-y">
                                    <img src="assets/img/home-1/about/shape-1.png" alt="img">
                                </div>
                                <div class="pp-shape-2 float-bob-y">
                                    <img src="assets/img/home-1/about/shape-2.png" alt="img">
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="about-content">
                                <div class="pp-section-title mb-0">
                                    <span class="pp-sub-title wow fadeInUp">ABOUT US</span>
                                    <h2 class="wow fadeInUp" data-wow-delay=".3s">
                                        Complete Business Management Solutions
                                    </h2>
                                </div>
                                <p class="pp-text wow fadeInUp" data-wow-delay=".5s">
                                    Whether you need our lightweight Starter custom ERP or a full-scale certified Odoo implementation, we provide the tools to track inventory, manage sales, and optimize your operations effortlessly.
                                </p>
                                <div class="about-count-item wow fadeInUp" data-wow-delay=".3s">
                                    <div class="count-text">
                                        <h2><span class="pp-count">500</span>+</h2>
                                        <p>
                                            Successful implementations
                                        </p>
                                    </div>
                                    <div class="count-text">
                                        <h2><span class="pp-count">100</span>%</h2>
                                        <p>
                                            Certified experts
                                        </p>
                                    </div>
                                    <div class="count-text">
                                        <h2>24/7</h2>
                                        <p>
                                           Dedicated support
                                        </p>
                                    </div>
                                </div>
                                <a href="about.html" class="pp-theme-btn wow fadeInUp" data-wow-delay=".5s">Discover More <i class="fa-solid fa-arrow-right-long"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

"""

if corrupted_start != -1 and offer_start != -1:
    html = html[:corrupted_start] + brand_and_about_html + html[offer_start:]
    print("Fixed Brand and About section!")

# 2. Add the custom testimonials to the ACTUAL Testimonials section
custom_testimonials_html = """        <!-- Pp-testimonial Section Start -->
        <section class="pp-testimonial-section section-padding fix">
            <div class="container">
                <div class="pp-section-title-area">
                    <div class="pp-section-title">
                        <span class="pp-sub-title wow fadeInUp">TESTIMONIALS</span>
                        <h2 class="wow fadeInUp" data-wow-delay=".3s">
                            Success Stories from Our Users
                        </h2>
                    </div>
                     <div class="pp-array-buttons wow fadeInUp" data-wow-delay=".5s">
                        <button class="array-prev"><i class="fa-solid fa-arrow-left-long"></i></button>
                        <button class="array-next"><i class="fa-solid fa-arrow-right-long"></i></button>
                  </div>
                </div>
                <div class="swiper pp-testimonial-slider">
                    <div class="swiper-wrapper">
                        <div class="swiper-slide">
                            <div class="pp-testimonial-card">
                                <p>
                                    “LetX POS is incredibly fast and reliable. As a motor parts distributor, tracking our vast inventory used to be a nightmare, but now everything is centralized and accurate.”
                                </p>
                                <div class="pp-client-info-item">
                                    <div class="pp-client-image">
                                        <img src="assets/img/home-1/testimonial/client-1.png" alt="img">
                                    </div>
                                    <div class="pp-content">
                                        <h5>Maxpolanka</h5>
                                        <span>Motor Parts Distributor</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="pp-testimonial-card">
                                <p>
                                    “The custom POS system provided by LetX is perfectly suited for our restaurant. Order taking and kitchen management have never been this seamless.”
                                </p>
                                <div class="pp-client-info-item">
                                    <div class="pp-client-image">
                                        <img src="assets/img/home-1/testimonial/client-2.png" alt="img">
                                    </div>
                                    <div class="pp-testimonial-content">
                                        <h5>Classy Kitchen</h5>
                                        <span>Restaurant</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="pp-testimonial-card">
                                <p>
                                    “Managing wholesale parts requires a robust ERP, and LetX delivered exactly what we needed. Our supply chain operations are now completely streamlined.”
                                </p>
                                <div class="pp-client-info-item">
                                    <div class="pp-client-image">
                                        <img src="assets/img/home-1/testimonial/client-1.png" alt="img">
                                    </div>
                                    <div class="pp-content">
                                        <h5>MBS</h5>
                                        <span>Wholesale Parts Shop</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="pp-testimonial-card">
                                <p>
                                    “We use the LetX ERP system to manage our entire fast-food chain. It handles everything from inventory to sales reporting effortlessly.”
                                </p>
                                <div class="pp-client-info-item">
                                    <div class="pp-client-image">
                                        <img src="assets/img/home-1/testimonial/client-2.png" alt="img">
                                    </div>
                                    <div class="pp-testimonial-content">
                                        <h5>Miss Burger</h5>
                                        <span>Fast Food Chain</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="pp-testimonial-card">
                                <p>
                                    “The HR & Payroll modules implemented by LetX have completely automated our employee management and payroll processing. Highly recommended!”
                                </p>
                                <div class="pp-client-info-item">
                                    <div class="pp-client-image">
                                        <img src="assets/img/home-1/testimonial/client-1.png" alt="img">
                                    </div>
                                    <div class="pp-content">
                                        <h5>Guru Agency</h5>
                                        <span>Agency</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="pp-testimonial-card">
                                <p>
                                    “Thanks to LetX's CRM, our customer retention has improved significantly. We can track all customer interactions and sales pipelines in one place.”
                                </p>
                                <div class="pp-client-info-item">
                                    <div class="pp-client-image">
                                        <img src="assets/img/home-1/testimonial/client-2.png" alt="img">
                                    </div>
                                    <div class="pp-testimonial-content">
                                        <h5>Pearlcart</h5>
                                        <span>Retail / E-commerce</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>"""

# Replace the ACTUAL Testimonials section (which currently has the Lorem ipsum or whatever is there)
html = re.sub(r'(?s)<!-- Pp-testimonial Section Start -->.*?</section>', custom_testimonials_html, html)
print("Updated actual Testimonials section!")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
