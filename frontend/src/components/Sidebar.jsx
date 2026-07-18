import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiActivity, FiCloudDrizzle, FiCpu, FiClock, FiTrendingUp } from 'react-icons/fi';
import { PiPlantBold } from 'react-icons/pi';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { t } = useLanguage();
  const navItems = [
    { path: '/', icon: <FiHome />, label: t('nav.dashboard') },
    { path: '/analytics', icon: <FiActivity />, label: t('nav.analytics') },
    { path: '/weather', icon: <FiCloudDrizzle />, label: t('nav.weather') },
    { path: '/market', icon: <FiTrendingUp />, label: t('nav.market') },
    { path: '/ai-assistant', icon: <FiCpu />, label: t('nav.ai_assistant') },
    { path: '/history', icon: <FiClock />, label: t('nav.history') },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <PiPlantBold size={28} color="#fff" />
        </div>
        <h1 className={styles.brandName}>AgroNix</h1>
      </div>

      <div className={styles.tagline}>Smart Farming Intelligence</div>

      <nav className={styles.navMenu}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.farmStatus}>
        <div className={styles.statusLabel}>Farm Status</div>
        <div className={styles.statusValue}>
          <span className={styles.indicator}></span>
          Optimal
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
