"use client";

export default function Skeleton({ 
  variant = 'line', 
  className = '',
  width = 'full',
  height = 'h-4',
  count = 1,
  animate = true 
}) {
  const animation = animate ? 'animate-pulse' : '';

  const variants = {
    line: `${height} bg-[#f2ece4] rounded-lg`,
    text: 'bg-[#f2ece4]/80 rounded-md',
    card: 'w-full h-64 bg-[#f2ece4] rounded-2xl',
    avatar: 'w-12 h-12 bg-[#f2ece4] rounded-full',
    grid: 'grid grid-cols-4 gap-4'
  };

  const styles = `${variants[variant]} ${width === 'full' ? 'w-full' : ''} ${animation} ${className}`;

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={styles} />
      ))}
    </>
  );
}

