import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ============ TYPES ============
export interface HeroSlide {
  _id?: string;
  bgImage: string;
  leftModelImage: string;
  rightModelImage: string;
  brandText: string;
  title: string;
  subtitle: string;
  buttonLink: string;
  displayOrder: number;
  isActive: boolean;
}

export interface BannerCategory {
  _id?: string;
  category: string;
  imageUrl: string;
  title: string;
  buttonText: string;
  buttonLink: string;
  displayOrder: number;
  isActive: boolean;
}

export interface OfferBanner {
  _id?: string;
  imageUrl: string;
  brandText: string;
  title: string;
  subtitle: string;
  buttonText: string;
  footerText: string;
  buttonLink: string;
  displayOrder: number;
  isActive: boolean;
}

export interface AboutSection {
  _id?: string;
  badgeText: string;
  title: string;
  description: string;
  stats: { branches: number; designs: number; clients: number };
  statsLabels: { branches: string; designs: string; clients: string };
  buttonText: string;
  buttonLink: string;
  bigImageUrl: string;
  smallImageUrl: string;
}

export interface PartnerSection {
  _id?: string;
  imageUrl: string;
  badgeText: string;
  title: string;
  description: string;
  benefits: string[];
  buttonText: string;
  buttonLink: string;
}

export interface PromoBanner {
  _id?: string;
  imageUrl: string;
  headingLine1: string;
  headingLine2: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export interface JewellerySection {
  _id?: string;
  leftImageUrl: string;
  badgeText: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export interface TestimonialSection {
  _id?: string;
  rightImageUrl: string;
  badgeText: string;
  title: string;
  testimonials: Array<{ name: string; location: string; text: string; avatar: string }>;
}

// ============ API FUNCTIONS ============
export const getHeroSlides = () => api.get('/cms/hero-slides').then(res => res.data);
export const addHeroSlide = (data: any) => api.post('/cms/admin/hero-slide', data).then(res => res.data);
export const updateHeroSlide = (id: string, data: any) => api.put(`/cms/admin/hero-slide/${id}`, data).then(res => res.data);
export const deleteHeroSlide = (id: string) => api.delete(`/cms/admin/hero-slide/${id}`);

export const getBannerCategories = () => api.get('/cms/banner-categories').then(res => res.data);
export const addBannerCategory = (data: any) => api.post('/cms/admin/banner-category', data).then(res => res.data);
export const updateBannerCategory = (id: string, data: any) => api.put(`/cms/admin/banner-category/${id}`, data).then(res => res.data);
export const deleteBannerCategory = (id: string) => api.delete(`/cms/admin/banner-category/${id}`);

export const getOfferBanners = () => api.get('/cms/offer-banners').then(res => res.data);
export const addOfferBanner = (data: any) => api.post('/cms/admin/offer-banner', data).then(res => res.data);
export const deleteOfferBanner = (id: string) => api.delete(`/cms/admin/offer-banner/${id}`);

export const getAboutSection = () => api.get('/cms/about-section').then(res => res.data);
export const updateAboutSection = (data: any) => api.post('/cms/admin/about-section', data).then(res => res.data);

export const getPartnerSection = () => api.get('/cms/partner-section').then(res => res.data);
export const updatePartnerSection = (data: any) => api.post('/cms/admin/partner-section', data).then(res => res.data);

export const getPromoBanner = () => api.get('/cms/promo-banner').then(res => res.data);
export const updatePromoBanner = (data: any) => api.post('/cms/admin/promo-banner', data).then(res => res.data);

export const getJewellerySection = () => api.get('/cms/jewellery-section').then(res => res.data);
export const updateJewellerySection = (data: any) => api.post('/cms/admin/jewellery-section', data).then(res => res.data);

export const getTestimonialSection = () => api.get('/cms/testimonial-section').then(res => res.data);
export const updateTestimonialSection = (data: any) => api.post('/cms/admin/testimonial-section', data).then(res => res.data);