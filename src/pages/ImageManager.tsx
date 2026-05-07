import React, { useState, useEffect } from 'react';
import {
  getHeroSlides, addHeroSlide, updateHeroSlide, deleteHeroSlide,
  getBannerCategories, addBannerCategory, updateBannerCategory, deleteBannerCategory,
  getOfferBanners, addOfferBanner, deleteOfferBanner,
  getAboutSection, updateAboutSection,
  getPartnerSection, updatePartnerSection,
  getPromoBanner, updatePromoBanner,
  getJewellerySection, updateJewellerySection,
  getTestimonialSection, updateTestimonialSection,
  HeroSlide, BannerCategory, OfferBanner, AboutSection, PartnerSection, PromoBanner, JewellerySection, TestimonialSection
} from '../lib/api';

type SectionType = 
  | 'hero' 
  | 'banner' 
  | 'jewellery' 
  | 'partner' 
  | 'promo' 
  | 'offer' 
  | 'about' 
  | 'testimonial';

const sections: { value: SectionType; label: string; description: string }[] = [
  { value: 'hero', label: '🎯 Hero Section', description: 'Manage hero slides (max 3 slides)' },
  { value: 'banner', label: '🏪 Shop by Category', description: 'Manage 4 category banners' },
  { value: 'jewellery', label: '✨ Stylish Design Collections', description: 'Manage left image and text' },
  { value: 'partner', label: '🤝 Partner With Jewelskart', description: 'Manage partner section image and content' },
  { value: 'promo', label: '⭐ Our Signature Brand', description: 'Manage promo banner' },
  { value: 'offer', label: '🎯 Offer Banners', description: 'Manage offer banners (multiple = auto grid)' },
  { value: 'about', label: '📖 About Us', description: 'Manage about section (text + 2 images)' },
  { value: 'testimonial', label: '💬 Testimonials', description: 'Manage testimonials and right image' }
];

const ImageManager: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<SectionType>('hero');
  const [loading, setLoading] = useState(false);
  
  // Hero states
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroForm, setHeroForm] = useState({
    bgImage: '', leftModelImage: '', rightModelImage: '', brandText: '', title: '', subtitle: '', buttonLink: '/shop', displayOrder: 0
  });
  const [editingHeroId, setEditingHeroId] = useState<string | null>(null);

  // Banner states
  const [bannerCategories, setBannerCategories] = useState<BannerCategory[]>([]);
  const [bannerForm, setBannerForm] = useState({
    category: 'pendants', imageUrl: '', title: '', buttonText: '', buttonLink: '', displayOrder: 0
  });
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // Offer states
  const [offerBanners, setOfferBanners] = useState<OfferBanner[]>([]);
  const [offerForm, setOfferForm] = useState({
    imageUrl: '', brandText: 'JEWELSKART', title: '', subtitle: 'EXCLUSIVE OFFER', buttonText: '', footerText: 'WWW.JEWELSKART.COM', buttonLink: '/shop', displayOrder: 0
  });

  // About state
  const [aboutData, setAboutData] = useState<AboutSection | null>(null);
  const [aboutForm, setAboutForm] = useState({
    badgeText: '', title: '', description: '', bigImageUrl: '', smallImageUrl: '', buttonText: '', buttonLink: '/about',
    branches: 0, designs: 0, clients: 0,
    branchesLabel: '', designsLabel: '', clientsLabel: ''
  });

  // Partner state
  const [partnerData, setPartnerData] = useState<PartnerSection | null>(null);
  const [partnerForm, setPartnerForm] = useState({
    imageUrl: '', badgeText: '', title: '', description: '', benefits: ['', '', ''], buttonText: '', buttonLink: ''
  });

  // Promo state
  const [promoData, setPromoData] = useState<PromoBanner | null>(null);
  const [promoForm, setPromoForm] = useState({
    imageUrl: '', headingLine1: '', headingLine2: '', description: '', buttonText: '', buttonLink: ''
  });

  // Jewellery state
  const [jewelleryData, setJewelleryData] = useState<JewellerySection | null>(null);
  const [jewelleryForm, setJewelleryForm] = useState({
    leftImageUrl: '', badgeText: '', title: '', description: '', buttonText: 'SHOP NOW', buttonLink: '/shop'
  });

  // Testimonial state
  const [testimonialData, setTestimonialData] = useState<TestimonialSection | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({
    rightImageUrl: '', badgeText: '', title: '', testimonials: [{ name: '', location: '', text: '', avatar: '' }]
  });

  useEffect(() => {
    loadSectionData();
  }, [selectedSection]);

  const loadSectionData = async () => {
    setLoading(true);
    try {
      switch (selectedSection) {
        case 'hero':
          const slides = await getHeroSlides();
          setHeroSlides(slides);
          break;
        case 'banner':
          const categories = await getBannerCategories();
          setBannerCategories(categories);
          break;
        case 'offer':
          const offers = await getOfferBanners();
          setOfferBanners(offers);
          break;
        case 'about':
          const about = await getAboutSection();
          setAboutData(about);
          if (about) {
            setAboutForm({
              badgeText: about.badgeText || '',
              title: about.title || '',
              description: about.description || '',
              bigImageUrl: about.bigImageUrl || '',
              smallImageUrl: about.smallImageUrl || '',
              buttonText: about.buttonText || '',
              buttonLink: about.buttonLink || '/about',
              branches: about.stats?.branches || 0,
              designs: about.stats?.designs || 0,
              clients: about.stats?.clients || 0,
              branchesLabel: about.statsLabels?.branches || '',
              designsLabel: about.statsLabels?.designs || '',
              clientsLabel: about.statsLabels?.clients || ''
            });
          }
          break;
        case 'partner':
          const partner = await getPartnerSection();
          setPartnerData(partner);
          if (partner) {
            setPartnerForm({
              imageUrl: partner.imageUrl || '',
              badgeText: partner.badgeText || '',
              title: partner.title || '',
              description: partner.description || '',
              benefits: partner.benefits?.length === 3 ? partner.benefits : ['', '', ''],
              buttonText: partner.buttonText || '',
              buttonLink: partner.buttonLink || ''
            });
          }
          break;
        case 'promo':
          const promo = await getPromoBanner();
          setPromoData(promo);
          if (promo) {
            setPromoForm({
              imageUrl: promo.imageUrl || '',
              headingLine1: promo.headingLine1 || '',
              headingLine2: promo.headingLine2 || '',
              description: promo.description || '',
              buttonText: promo.buttonText || '',
              buttonLink: promo.buttonLink || ''
            });
          }
          break;
        case 'jewellery':
          const jewellery = await getJewellerySection();
          setJewelleryData(jewellery);
          if (jewellery) {
            setJewelleryForm({
              leftImageUrl: jewellery.leftImageUrl || '',
              badgeText: jewellery.badgeText || '',
              title: jewellery.title || '',
              description: jewellery.description || '',
              buttonText: jewellery.buttonText || 'SHOP NOW',
              buttonLink: jewellery.buttonLink || '/shop'
            });
          }
          break;
        case 'testimonial':
          const testimonial = await getTestimonialSection();
          setTestimonialData(testimonial);
          if (testimonial) {
            setTestimonialForm({
              rightImageUrl: testimonial.rightImageUrl || '',
              badgeText: testimonial.badgeText || '',
              title: testimonial.title || '',
              testimonials: testimonial.testimonials?.length ? testimonial.testimonials : [{ name: '', location: '', text: '', avatar: '' }]
            });
          }
          break;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingHeroId) {
        await updateHeroSlide(editingHeroId, heroForm);
        alert('✅ Slide updated!');
      } else {
        await addHeroSlide(heroForm);
        alert('✅ Slide added!');
      }
      setHeroForm({ bgImage: '', leftModelImage: '', rightModelImage: '', brandText: '', title: '', subtitle: '', buttonLink: '/shop', displayOrder: 0 });
      setEditingHeroId(null);
      loadSectionData();
    } catch (error) {
      alert('❌ Error saving');
    } finally {
      setLoading(false);
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingBannerId) {
        await updateBannerCategory(editingBannerId, bannerForm);
        alert('✅ Category updated!');
      } else {
        await addBannerCategory(bannerForm);
        alert('✅ Category added!');
      }
      setBannerForm({ category: 'pendants', imageUrl: '', title: '', buttonText: '', buttonLink: '', displayOrder: 0 });
      setEditingBannerId(null);
      loadSectionData();
    } catch (error) {
      alert('❌ Error saving');
    } finally {
      setLoading(false);
    }
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addOfferBanner(offerForm);
      alert('✅ Offer banner added!');
      setOfferForm({ imageUrl: '', brandText: 'JEWELSKART', title: '', subtitle: 'EXCLUSIVE OFFER', buttonText: '', footerText: 'WWW.JEWELSKART.COM', buttonLink: '/shop', displayOrder: 0 });
      loadSectionData();
    } catch (error) {
      alert('❌ Error saving');
    } finally {
      setLoading(false);
    }
  };

  const handleAboutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateAboutSection({
        badgeText: aboutForm.badgeText,
        title: aboutForm.title,
        description: aboutForm.description,
        bigImageUrl: aboutForm.bigImageUrl,
        smallImageUrl: aboutForm.smallImageUrl,
        buttonText: aboutForm.buttonText,
        buttonLink: aboutForm.buttonLink,
        stats: { branches: aboutForm.branches, designs: aboutForm.designs, clients: aboutForm.clients },
        statsLabels: { branches: aboutForm.branchesLabel, designs: aboutForm.designsLabel, clients: aboutForm.clientsLabel }
      });
      alert('✅ About section updated!');
      loadSectionData();
    } catch (error) {
      alert('❌ Error saving');
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePartnerSection(partnerForm);
      alert('✅ Partner section updated!');
      loadSectionData();
    } catch (error) {
      alert('❌ Error saving');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePromoBanner(promoForm);
      alert('✅ Promo banner updated!');
      loadSectionData();
    } catch (error) {
      alert('❌ Error saving');
    } finally {
      setLoading(false);
    }
  };

  const handleJewellerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateJewellerySection(jewelleryForm);
      alert('✅ Jewellery section updated!');
      loadSectionData();
    } catch (error) {
      alert('❌ Error saving');
    } finally {
      setLoading(false);
    }
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateTestimonialSection(testimonialForm);
      alert('✅ Testimonial section updated!');
      loadSectionData();
    } catch (error) {
      alert('❌ Error saving');
    } finally {
      setLoading(false);
    }
  };

  const handleHeroDelete = async (id: string) => {
    if (window.confirm('Delete this slide?')) {
      setLoading(true);
      try {
        await deleteHeroSlide(id);
        alert('✅ Deleted!');
        loadSectionData();
      } catch (error) {
        alert('❌ Error deleting');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBannerDelete = async (id: string) => {
    if (window.confirm('Delete this category?')) {
      setLoading(true);
      try {
        await deleteBannerCategory(id);
        alert('✅ Deleted!');
        loadSectionData();
      } catch (error) {
        alert('❌ Error deleting');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOfferDelete = async (id: string) => {
    if (window.confirm('Delete this offer banner?')) {
      setLoading(true);
      try {
        await deleteOfferBanner(id);
        alert('✅ Deleted!');
        loadSectionData();
      } catch (error) {
        alert('❌ Error deleting');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderHeroForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">{editingHeroId ? '✏️ Edit Slide' : '➕ Add New Slide'}</h3>
          <form onSubmit={handleHeroSubmit} className="space-y-3">
            <input type="text" placeholder="Background Image URL" value={heroForm.bgImage} onChange={(e) => setHeroForm({...heroForm, bgImage: e.target.value})} className="w-full border rounded px-3 py-2" required />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Left Model Image" value={heroForm.leftModelImage} onChange={(e) => setHeroForm({...heroForm, leftModelImage: e.target.value})} className="w-full border rounded px-3 py-2" required />
              <input type="text" placeholder="Right Model Image" value={heroForm.rightModelImage} onChange={(e) => setHeroForm({...heroForm, rightModelImage: e.target.value})} className="w-full border rounded px-3 py-2" required />
            </div>
            <input type="text" placeholder="Brand Text (e.g., JEWELSKART)" value={heroForm.brandText} onChange={(e) => setHeroForm({...heroForm, brandText: e.target.value})} className="w-full border rounded px-3 py-2" required />
            <input type="text" placeholder="Title (e.g., TIMELESS ELEGANCE)" value={heroForm.title} onChange={(e) => setHeroForm({...heroForm, title: e.target.value})} className="w-full border rounded px-3 py-2" required />
            <textarea placeholder="Subtitle" value={heroForm.subtitle} onChange={(e) => setHeroForm({...heroForm, subtitle: e.target.value})} className="w-full border rounded px-3 py-2" rows={2} required />
            <input type="text" placeholder="Button Link" value={heroForm.buttonLink} onChange={(e) => setHeroForm({...heroForm, buttonLink: e.target.value})} className="w-full border rounded px-3 py-2" />
            <input type="number" placeholder="Display Order" value={heroForm.displayOrder} onChange={(e) => setHeroForm({...heroForm, displayOrder: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2" />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">{loading ? 'Saving...' : (editingHeroId ? 'Update Slide' : 'Add Slide')}</button>
          </form>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">📸 Existing Slides ({heroSlides.length})</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {heroSlides.map((slide, idx) => (
              <div key={slide._id} className="border rounded p-3">
                <img src={slide.bgImage} className="w-full h-24 object-cover rounded mb-2" />
                <p className="font-medium">{slide.title}</p>
                <p className="text-sm text-gray-500">{slide.brandText}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => {
                    setEditingHeroId(slide._id!);
                    setHeroForm({
                      bgImage: slide.bgImage,
                      leftModelImage: slide.leftModelImage,
                      rightModelImage: slide.rightModelImage,
                      brandText: slide.brandText,
                      title: slide.title,
                      subtitle: slide.subtitle,
                      buttonLink: slide.buttonLink,
                      displayOrder: slide.displayOrder
                    });
                  }} className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">Edit</button>
                  <button onClick={() => handleHeroDelete(slide._id!)} className="bg-red-500 text-white px-2 py-1 rounded text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
          {heroSlides.length >= 2 && <p className="mt-3 text-green-600 text-sm">✨ {heroSlides.length} slides = Auto slider will work</p>}
        </div>
      </div>
    </div>
  );

  const renderBannerForm = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">{editingBannerId ? '✏️ Edit Category' : '➕ Add Category'}</h3>
        <form onSubmit={handleBannerSubmit} className="space-y-3">
          <select value={bannerForm.category} onChange={(e) => setBannerForm({...bannerForm, category: e.target.value, title: e.target.value.toUpperCase(), buttonText: `shop ${e.target.value}`, buttonLink: `/shop?category=${e.target.value}`})} className="w-full border rounded px-3 py-2">
            <option value="pendants">PENDANTS</option>
            <option value="rings">RINGS</option>
            <option value="bracelets">BRACELETS</option>
            <option value="earrings">EARRINGS</option>
          </select>
          <input type="text" placeholder="Image URL" value={bannerForm.imageUrl} onChange={(e) => setBannerForm({...bannerForm, imageUrl: e.target.value})} className="w-full border rounded px-3 py-2" required />
          <input type="text" placeholder="Display Order" value={bannerForm.displayOrder} onChange={(e) => setBannerForm({...bannerForm, displayOrder: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2" />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">{loading ? 'Saving...' : (editingBannerId ? 'Update' : 'Add Category')}</button>
        </form>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">📸 Existing Categories ({bannerCategories.length}/4)</h3>
        <div className="space-y-3">
          {bannerCategories.map((cat) => (
            <div key={cat._id} className="border rounded p-3 flex gap-3 items-center">
              <img src={cat.imageUrl} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <p className="font-medium">{cat.title}</p>
                <p className="text-sm text-gray-500">{cat.category}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  setEditingBannerId(cat._id!);
                  setBannerForm({
                    category: cat.category,
                    imageUrl: cat.imageUrl,
                    title: cat.title,
                    buttonText: cat.buttonText,
                    buttonLink: cat.buttonLink,
                    displayOrder: cat.displayOrder
                  });
                }} className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">Edit</button>
                <button onClick={() => handleBannerDelete(cat._id!)} className="bg-red-500 text-white px-2 py-1 rounded text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOfferForm = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">➕ Add Offer Banner</h3>
        <form onSubmit={handleOfferSubmit} className="space-y-3">
          <input type="text" placeholder="Image URL" value={offerForm.imageUrl} onChange={(e) => setOfferForm({...offerForm, imageUrl: e.target.value})} className="w-full border rounded px-3 py-2" required />
          <input type="text" placeholder="Title (e.g., RINGS)" value={offerForm.title} onChange={(e) => setOfferForm({...offerForm, title: e.target.value})} className="w-full border rounded px-3 py-2" required />
          <input type="text" placeholder="Button Text (e.g., 20% OFF)" value={offerForm.buttonText} onChange={(e) => setOfferForm({...offerForm, buttonText: e.target.value})} className="w-full border rounded px-3 py-2" required />
          <input type="number" placeholder="Display Order" value={offerForm.displayOrder} onChange={(e) => setOfferForm({...offerForm, displayOrder: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2" />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">Add Banner</button>
        </form>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">📸 Existing Offer Banners ({offerBanners.length})</h3>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {offerBanners.map((banner) => (
            <div key={banner._id} className="border rounded p-3">
              <img src={banner.imageUrl} className="w-full h-32 object-cover rounded mb-2" />
              <p className="font-medium">{banner.title}</p>
              <p className="text-sm text-gray-500">{banner.buttonText}</p>
              <button onClick={() => handleOfferDelete(banner._id!)} className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
            </div>
          ))}
        </div>
        {offerBanners.length >= 2 && <p className="mt-3 text-green-600 text-sm">✨ {offerBanners.length} banners = Auto grid layout</p>}
      </div>
    </div>
  );

  const renderAboutForm = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4">✏️ Edit About Section</h3>
      <form onSubmit={handleAboutSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Badge Text</label>
            <input type="text" value={aboutForm.badgeText} onChange={(e) => setAboutForm({...aboutForm, badgeText: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" value={aboutForm.title} onChange={(e) => setAboutForm({...aboutForm, title: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={aboutForm.description} onChange={(e) => setAboutForm({...aboutForm, description: e.target.value})} className="w-full border rounded px-3 py-2" rows={3} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Branches</label>
            <input type="number" value={aboutForm.branches} onChange={(e) => setAboutForm({...aboutForm, branches: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2" />
            <input type="text" placeholder="Label" value={aboutForm.branchesLabel} onChange={(e) => setAboutForm({...aboutForm, branchesLabel: e.target.value})} className="w-full border rounded px-3 py-2 mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Designs</label>
            <input type="number" value={aboutForm.designs} onChange={(e) => setAboutForm({...aboutForm, designs: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2" />
            <input type="text" placeholder="Label" value={aboutForm.designsLabel} onChange={(e) => setAboutForm({...aboutForm, designsLabel: e.target.value})} className="w-full border rounded px-3 py-2 mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Clients</label>
            <input type="number" value={aboutForm.clients} onChange={(e) => setAboutForm({...aboutForm, clients: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2" />
            <input type="text" placeholder="Label" value={aboutForm.clientsLabel} onChange={(e) => setAboutForm({...aboutForm, clientsLabel: e.target.value})} className="w-full border rounded px-3 py-2 mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Big Image URL</label>
            <input type="text" value={aboutForm.bigImageUrl} onChange={(e) => setAboutForm({...aboutForm, bigImageUrl: e.target.value})} className="w-full border rounded px-3 py-2" />
            {aboutForm.bigImageUrl && <img src={aboutForm.bigImageUrl} className="mt-2 h-20 object-cover rounded" />}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Small Image URL</label>
            <input type="text" value={aboutForm.smallImageUrl} onChange={(e) => setAboutForm({...aboutForm, smallImageUrl: e.target.value})} className="w-full border rounded px-3 py-2" />
            {aboutForm.smallImageUrl && <img src={aboutForm.smallImageUrl} className="mt-2 h-20 object-cover rounded" />}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Button Text</label>
            <input type="text" value={aboutForm.buttonText} onChange={(e) => setAboutForm({...aboutForm, buttonText: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Button Link</label>
            <input type="text" value={aboutForm.buttonLink} onChange={(e) => setAboutForm({...aboutForm, buttonLink: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">Save About Section</button>
      </form>
    </div>
  );

  const renderPartnerForm = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4">✏️ Edit Partner Section</h3>
      <form onSubmit={handlePartnerSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input type="text" value={partnerForm.imageUrl} onChange={(e) => setPartnerForm({...partnerForm, imageUrl: e.target.value})} className="w-full border rounded px-3 py-2" required />
          {partnerForm.imageUrl && <img src={partnerForm.imageUrl} className="mt-2 h-20 object-cover rounded" />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Badge Text</label>
            <input type="text" value={partnerForm.badgeText} onChange={(e) => setPartnerForm({...partnerForm, badgeText: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" value={partnerForm.title} onChange={(e) => setPartnerForm({...partnerForm, title: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={partnerForm.description} onChange={(e) => setPartnerForm({...partnerForm, description: e.target.value})} className="w-full border rounded px-3 py-2" rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Benefits (3 items)</label>
          <div className="space-y-2">
            {partnerForm.benefits.map((benefit, idx) => (
              <input key={idx} type="text" placeholder={`Benefit ${idx + 1}`} value={benefit} onChange={(e) => {
                const newBenefits = [...partnerForm.benefits];
                newBenefits[idx] = e.target.value;
                setPartnerForm({...partnerForm, benefits: newBenefits});
              }} className="w-full border rounded px-3 py-2" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Button Text</label>
            <input type="text" value={partnerForm.buttonText} onChange={(e) => setPartnerForm({...partnerForm, buttonText: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Button Link</label>
            <input type="text" value={partnerForm.buttonLink} onChange={(e) => setPartnerForm({...partnerForm, buttonLink: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">Save Partner Section</button>
      </form>
    </div>
  );

  const renderPromoForm = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4">✏️ Edit Promo Banner</h3>
      <form onSubmit={handlePromoSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Background Image URL</label>
          <input type="text" value={promoForm.imageUrl} onChange={(e) => setPromoForm({...promoForm, imageUrl: e.target.value})} className="w-full border rounded px-3 py-2" required />
          {promoForm.imageUrl && <img src={promoForm.imageUrl} className="mt-2 h-20 object-cover rounded" />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Heading Line 1</label>
            <input type="text" value={promoForm.headingLine1} onChange={(e) => setPromoForm({...promoForm, headingLine1: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Heading Line 2 (Brand Name)</label>
            <input type="text" value={promoForm.headingLine2} onChange={(e) => setPromoForm({...promoForm, headingLine2: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={promoForm.description} onChange={(e) => setPromoForm({...promoForm, description: e.target.value})} className="w-full border rounded px-3 py-2" rows={2} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Button Text</label>
            <input type="text" value={promoForm.buttonText} onChange={(e) => setPromoForm({...promoForm, buttonText: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Button Link</label>
            <input type="text" value={promoForm.buttonLink} onChange={(e) => setPromoForm({...promoForm, buttonLink: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">Save Promo Banner</button>
      </form>
    </div>
  );

  const renderJewelleryForm = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4">✏️ Edit Stylish Design Section</h3>
      <form onSubmit={handleJewellerySubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Left Image URL</label>
          <input type="text" value={jewelleryForm.leftImageUrl} onChange={(e) => setJewelleryForm({...jewelleryForm, leftImageUrl: e.target.value})} className="w-full border rounded px-3 py-2" required />
          {jewelleryForm.leftImageUrl && <img src={jewelleryForm.leftImageUrl} className="mt-2 h-20 object-cover rounded" />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Badge Text</label>
            <input type="text" value={jewelleryForm.badgeText} onChange={(e) => setJewelleryForm({...jewelleryForm, badgeText: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" value={jewelleryForm.title} onChange={(e) => setJewelleryForm({...jewelleryForm, title: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={jewelleryForm.description} onChange={(e) => setJewelleryForm({...jewelleryForm, description: e.target.value})} className="w-full border rounded px-3 py-2" rows={2} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Button Text</label>
            <input type="text" value={jewelleryForm.buttonText} onChange={(e) => setJewelleryForm({...jewelleryForm, buttonText: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Button Link</label>
            <input type="text" value={jewelleryForm.buttonLink} onChange={(e) => setJewelleryForm({...jewelleryForm, buttonLink: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">Save Section</button>
      </form>
    </div>
  );

  const renderTestimonialForm = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4">✏️ Edit Testimonial Section</h3>
      <form onSubmit={handleTestimonialSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Right Image URL</label>
          <input type="text" value={testimonialForm.rightImageUrl} onChange={(e) => setTestimonialForm({...testimonialForm, rightImageUrl: e.target.value})} className="w-full border rounded px-3 py-2" required />
          {testimonialForm.rightImageUrl && <img src={testimonialForm.rightImageUrl} className="mt-2 h-20 object-cover rounded" />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Badge Text</label>
            <input type="text" value={testimonialForm.badgeText} onChange={(e) => setTestimonialForm({...testimonialForm, badgeText: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" value={testimonialForm.title} onChange={(e) => setTestimonialForm({...testimonialForm, title: e.target.value})} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Testimonials</label>
          {testimonialForm.testimonials.map((t, idx) => (
            <div key={idx} className="border rounded p-3 mb-3">
              <input type="text" placeholder="Name" value={t.name} onChange={(e) => {
                const newTest = [...testimonialForm.testimonials];
                newTest[idx].name = e.target.value;
                setTestimonialForm({...testimonialForm, testimonials: newTest});
              }} className="w-full border rounded px-3 py-2 mb-2" />
              <input type="text" placeholder="Location" value={t.location} onChange={(e) => {
                const newTest = [...testimonialForm.testimonials];
                newTest[idx].location = e.target.value;
                setTestimonialForm({...testimonialForm, testimonials: newTest});
              }} className="w-full border rounded px-3 py-2 mb-2" />
              <textarea placeholder="Testimonial Text" value={t.text} onChange={(e) => {
                const newTest = [...testimonialForm.testimonials];
                newTest[idx].text = e.target.value;
                setTestimonialForm({...testimonialForm, testimonials: newTest});
              }} className="w-full border rounded px-3 py-2 mb-2" rows={2} />
              <input type="text" placeholder="Avatar URL" value={t.avatar} onChange={(e) => {
                const newTest = [...testimonialForm.testimonials];
                newTest[idx].avatar = e.target.value;
                setTestimonialForm({...testimonialForm, testimonials: newTest});
              }} className="w-full border rounded px-3 py-2" />
            </div>
          ))}
          <button type="button" onClick={() => setTestimonialForm({...testimonialForm, testimonials: [...testimonialForm.testimonials, { name: '', location: '', text: '', avatar: '' }]})} className="bg-gray-200 px-3 py-1 rounded text-sm">+ Add Testimonial</button>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">Save Testimonial Section</button>
      </form>
    </div>
  );

  const currentSection = sections.find(s => s.value === selectedSection);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🖼️ CMS Image Manager</h1>
        <p className="text-gray-600">Manage all section images and content from one place</p>
      </div>

      {/* Section Selector */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <label className="block text-sm font-medium mb-2">Select Section to Manage</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {sections.map(s => (
            <button
              key={s.value}
              onClick={() => setSelectedSection(s.value)}
              className={`px-4 py-2 rounded-lg text-left transition ${selectedSection === s.value ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <div className="font-medium">{s.label}</div>
              <div className="text-xs opacity-75">{s.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Section Description */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">{currentSection?.description}</p>
      </div>

      {/* Render Selected Section Form */}
      {loading && <div className="text-center py-10">Loading...</div>}
      
      {!loading && selectedSection === 'hero' && renderHeroForm()}
      {!loading && selectedSection === 'banner' && renderBannerForm()}
      {!loading && selectedSection === 'offer' && renderOfferForm()}
      {!loading && selectedSection === 'about' && renderAboutForm()}
      {!loading && selectedSection === 'partner' && renderPartnerForm()}
      {!loading && selectedSection === 'promo' && renderPromoForm()}
      {!loading && selectedSection === 'jewellery' && renderJewelleryForm()}
      {!loading && selectedSection === 'testimonial' && renderTestimonialForm()}
    </div>
  );
};

export default ImageManager;
