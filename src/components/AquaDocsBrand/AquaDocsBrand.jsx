import banner from '../../assets/aquadocs-ai-banner.png';

// Both viewports expose the official artwork; the raster source is shared/cached with the hero.
const AquaDocsBrand = ({ compact = false }) => (
    <span className={`aquadocs-brand${compact ? ' aquadocs-brand-compact' : ''}`} aria-hidden="true">
        <svg className="aquadocs-brand-wordmark" viewBox="68 133 604 121" focusable="false">
            <image href={banner} width="1672" height="941" />
        </svg>
        <svg className="aquadocs-brand-symbol" viewBox="68 133 90 121" focusable="false">
            <image href={banner} width="1672" height="941" />
        </svg>
    </span>
);

export default AquaDocsBrand;
