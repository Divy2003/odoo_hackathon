const Avatar = ({ 
  src, 
  name, 
  size = 'medium', 
  className = '',
  onClick 
}) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    small: 'avatar-small',
    medium: 'avatar-medium', 
    large: 'avatar-large',
    xlarge: 'avatar-xlarge'
  };

  const baseClass = `avatar ${sizeClasses[size]} ${className}`;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={baseClass}
        onClick={onClick}
      />
    );
  }

  return (
    <div 
      className={`${baseClass} avatar-initials`}
      onClick={onClick}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
