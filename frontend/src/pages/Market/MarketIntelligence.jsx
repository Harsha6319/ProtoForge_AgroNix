import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useMarketData } from '../../hooks/useMarketData';
import { useLanguage } from '../../contexts/LanguageContext';
import MarketHero from '../../components/Market/MarketHero';
import PriceAnalytics from '../../components/Market/PriceAnalytics';
import TopBuyingMarkets from '../../components/Market/TopBuyingMarkets';
import AITradingAdvisor from '../../components/Market/AITradingAdvisor';
import GlobalMarket from '../../components/Market/GlobalMarket';
import GeoSpatialMarkets from '../../components/Market/GeoSpatialMarkets';
import styles from './MarketIntelligence.module.css';

const crops = ['Wheat', 'Rice', 'Cotton', 'Tomato', 'Onion', 'Potato', 'Maize', 'Groundnut', 'Sugarcane', 'Millets', 'Vegetables', 'Fruits'];

const MarketIntelligence = () => {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const { data, loading, error } = useMarketData(selectedCrop);

  const handleCropChange = (e) => setSelectedCrop(e.target.value);

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Spinner animation="border" variant="success" />
        <p>{t('market.loading') || 'Loading Market Data...'} {t(`market.crops.${selectedCrop}`) || selectedCrop}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!data || !data.dashboard) return null;

  return (
    <div className={styles.marketContainer}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.pageTitle}>{'Market Intelligence'}</h2>
          <p className={styles.pageSubtitle}>{'AI-powered market insights and predictions'}</p>
        </div>
        <div className={styles.controls}>
          <input
            type="text"
            placeholder={t('market.search') || 'Search globally...'}
            className={styles.searchBar}
          />
          <select value={selectedCrop} onChange={handleCropChange} className={styles.cropSelect}>
            {crops.map(crop => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
          <button className={styles.exportBtn}>{t('market.export') || 'Export Data'}</button>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        {/* Top Row: Hero and AI Advisor */}
        <div className={styles.topRow}>
          <div className={styles.premiumCard}>
            <MarketHero overview={data.dashboard.overview} crop={selectedCrop} />
          </div>
          <div className={styles.premiumCard}>
            <AITradingAdvisor recommendation={data.dashboard.aiRecommendation} />
          </div>
        </div>

        {/* Mid Row: Charts and Mandis */}
        <div className={styles.midRow}>
          <div className={styles.premiumCard}>
            <PriceAnalytics history={data.dashboard.history} forecast={data.dashboard.forecast} crop={selectedCrop} />
          </div>
          <div className={styles.premiumCard}>
            <TopBuyingMarkets mandis={data.vendors?.topMandis || []} />
          </div>
        </div>

        {/* Map Row: GeoSpatial Markets */}
        <div style={{ marginTop: '1.5rem', height: '550px' }}>
          <GeoSpatialMarkets crop={selectedCrop} />
        </div>

        {/* Bottom Row: Global */}
        <div className={styles.midRow} style={{ marginTop: '1.5rem' }}>
          <div className={styles.premiumCard}>
            <GlobalMarket globalData={data.global?.globalData || []} crop={selectedCrop} />
          </div>
          <div className={styles.premiumCard}>
            {/* Placeholder for News/MSP component which we will build next */}
          </div>
        </div>
      </div>

    </div>
  );
};

export default MarketIntelligence;
