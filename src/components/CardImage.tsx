/**
 * ============================================================
 * CardImage — STATELESS (Functional) Component
 * ============================================================
 * LESSON EXERCISE:
 *   "Create Stateless OR Stateful component for CardImage
 *    component that can receive imageUrl, title and description
 *    as props."
 *
 * We chose Stateless because a card with an image is purely
 * presentational — it only displays data from props and owns
 * no internal state.
 *
 * LESSON CONCEPT APPLIED:
 *   ✅ Stateless Component
 *   ✅ Props: imageUrl, title, description
 *   ✅ PropTypes
 *   ✅ Default Props
 * ============================================================
 */

import PropTypes from "prop-types";
import type { CardImageProps } from "../types";
import "../styles/Card.css";

const CardImage: React.FC<CardImageProps> = ({
  imageUrl,
  title,
  description,
}) => {
  return (
    <div className="card card--image">
      <img src={imageUrl} alt={title} className="card__image" />
      <div className="card__content">
        <h3 className="card__title">{title}</h3>
        <p className="card__description">{description}</p>
      </div>
    </div>
  );
};

CardImage.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default CardImage;
