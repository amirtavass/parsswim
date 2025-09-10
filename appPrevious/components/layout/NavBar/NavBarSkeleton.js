function NavBarSkeleton() {
  return (
    <div className="hidden md:flex items-center space-x-8 space-x-reverse">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
      <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
      <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
      <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
    </div>
  );
}

export default NavBarSkeleton;
