// // src/pages/ButtonShowcase.jsx
// import React, { useState } from 'react';
// import Button from './Button';

// const Buttons = () => {
//   const [loading, setLoading] = useState(false);
//   const [disabled, setDisabled] = useState(false);
//   const [count, setCount] = useState(0);
//   const [liked, setLiked] = useState(false);
//   const [cartItems, setCartItems] = useState(3);

//   const handleLoading = () => {
//     setLoading(true);
//     setTimeout(() => setLoading(false), 2000);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
//             Button Component Showcase
//           </h1>
//           <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
//             Real-world use cases with side-by-side code examples. 
//             Every button pattern used in professional applications.
//           </p>
//         </div>

//         {/* Live Controls */}
//         <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
//           <div className="flex flex-wrap gap-4 justify-center">
//             <Button
//               variant="outline"
//               onClick={() => setDisabled(!disabled)}
//               icon={disabled ? "✅" : "⛔"}
//             >
//               {disabled ? 'Enable All' : 'Disable All'}
//             </Button>
//             <Button
//               variant="outline"
//               onClick={handleLoading}
//               loading={loading}
//               icon="⏳"
//             >
//               {loading ? 'Loading...' : 'Simulate Loading'}
//             </Button>
//             <Button
//               variant="outline"
//               onClick={() => setCount(c => c + 1)}
//               icon="🎯"
//             >
//               Clicks: {count}
//             </Button>
//           </div>
//         </div>

//         {/* Use Cases Grid */}
//         <div className="space-y-12">
          
//           {/* 1. E-commerce Use Cases */}
//           <section>
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
//               🛒 E-commerce Buttons
//             </h2>
            
//             <div className="space-y-8">
//               {/* Add to Cart */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
//                   <h3 className="text-lg font-semibold mb-4">Add to Cart Button</h3>
//                   <div className="space-y-4">
//                     <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                       <Button
//                         variant="cart"
//                         size="addcart"
//                         icon="🛒"
//                         loading={loading}
//                         disabled={disabled}
//                         fullWidth
//                         onClick={() => {
//                           setCartItems(c => c + 1);
//                           alert('Added to cart!');
//                         }}
//                         ariaLabel="Add product to shopping cart"
//                         dataTestId="add-to-cart"
//                       >
//                         Add to Cart - $49.99
//                       </Button>
//                       <div className="mt-4 text-sm text-gray-500">
//                         Cart Items: {cartItems}
//                       </div>
//                     </div>
//                     <div className="text-sm text-gray-600 dark:text-gray-400">
//                       <span className="font-medium">Usage:</span> Product pages, shopping experience
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="bg-gray-900 rounded-xl p-6">
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-lg font-semibold text-white">Code</h3>
//                     <Button
//                       variant="outline"
//                       size="small"
//                       onClick={() => navigator.clipboard.writeText(`<Button
//   variant="cart"
//   size="addcart"
//   icon="🛒"
//   loading={isAddingToCart}
//   disabled={product.outOfStock}
//   fullWidth
//   onClick={handleAddToCart}
//   ariaLabel={\`Add \${productName} to cart\`}
//   dataTestId="add-to-cart"
// >
//   {product.outOfStock ? 'Out of Stock' : \`Add to Cart - $\${price}\`}
// </Button>`)}
//                       className="text-white border-white/20 hover:bg-white/10"
//                     >
//                       📋 Copy
//                     </Button>
//                   </div>
//                   <pre className="text-gray-100 text-sm overflow-x-auto">
// {`<Button
//   variant="cart"
//   size="addcart"
//   icon="🛒"
//   loading={isAddingToCart}
//   disabled={product.outOfStock}
//   fullWidth
//   onClick={handleAddToCart}
//   ariaLabel={\`Add \${productName} to cart\`}
//   dataTestId="add-to-cart"
// >
//   {product.outOfStock ? 'Out of Stock' : \`Add to Cart - $\${price}\`}
// </Button>`}
//                   </pre>
//                   <div className="mt-4 text-sm text-gray-400">
//                     <div className="font-medium mb-2">Features:</div>
//                     <ul className="space-y-1">
//                       <li>• Gradient styling for visual prominence</li>
//                       <li>• Loading state during API call</li>
//                       <li>• Disabled when out of stock</li>
//                       <li>• Full width for mobile optimization</li>
//                       <li>• Accessible label for screen readers</li>
//                       <li>• Test ID for automated testing</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>

//               {/* Buy Now & Wishlist */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
//                   <h3 className="text-lg font-semibold mb-4">Buy Now & Wishlist</h3>
//                   <div className="space-y-4">
//                     <div className="flex flex-col gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                       <Button
//                         variant="primary"
//                         size="large"
//                         icon="⚡"
//                         iconPosition="right"
//                         fullWidth
//                         loading={loading}
//                         disabled={disabled}
//                       >
//                         Buy Now with 1-Click
//                       </Button>
//                       <div className="flex gap-3">
//                         <Button
//                           variant="outline"
//                           icon={liked ? "❤️" : "🤍"}
//                           onClick={() => setLiked(!liked)}
//                           disabled={disabled}
//                           ariaLabel={liked ? "Remove from wishlist" : "Add to wishlist"}
//                         >
//                           {liked ? "In Wishlist" : "Add to Wishlist"}
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           icon="📦"
//                           disabled={disabled}
//                         >
//                           Save for Later
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="bg-gray-900 rounded-xl p-6">
//                   <pre className="text-gray-100 text-sm overflow-x-auto">
// {`// Buy Now Button
// <Button
//   variant="primary"
//   size="large"
//   icon="⚡"
//   iconPosition="right"
//   fullWidth
//   loading={processingPurchase}
//   onClick={handleOneClickPurchase}
// >
//   Buy Now with 1-Click
// </Button>

// // Wishlist Button
// <Button
//   variant="outline"
//   icon={isInWishlist ? "❤️" : "🤍"}
//   onClick={toggleWishlist}
//   ariaLabel={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
// >
//   {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
// </Button>`}
//                   </pre>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* 2. Form Buttons */}
//           <section>
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
//               📝 Form & Data Entry Buttons
//             </h2>
            
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
//                 <h3 className="text-lg font-semibold mb-4">Form Submission & Actions</h3>
//                 <div className="space-y-6">
//                   {/* Submit Button */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <Button
//                       type="submit"
//                       variant="primary"
//                       loading={loading}
//                       disabled={disabled}
//                       fullWidth
//                       icon="✅"
//                     >
//                       Submit Form
//                     </Button>
//                     <div className="mt-2 text-sm text-gray-500">
//                       Validates form and submits data
//                     </div>
//                   </div>
                  
//                   {/* Form Action Group */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <div className="flex gap-3">
//                       <Button
//                         variant="outline"
//                         disabled={disabled}
//                         icon="↩️"
//                       >
//                         Cancel
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         disabled={disabled}
//                         icon="💾"
//                       >
//                         Save Draft
//                       </Button>
//                       <Button
//                         variant="primary"
//                         loading={loading}
//                         disabled={disabled}
//                         icon="📤"
//                       >
//                         Publish
//                       </Button>
//                     </div>
//                     <div className="mt-2 text-sm text-gray-500">
//                       Multiple actions with visual hierarchy
//                     </div>
//                   </div>
                  
//                   {/* Form Stepper */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <div className="flex justify-between items-center">
//                       <Button
//                         variant="outline"
//                         icon="←"
//                         disabled={disabled}
//                       >
//                         Previous
//                       </Button>
//                       <span className="text-sm font-medium">Step 2 of 4</span>
//                       <Button
//                         variant="primary"
//                         icon="→"
//                         iconPosition="right"
//                         loading={loading}
//                         disabled={disabled}
//                       >
//                         Next
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="bg-gray-900 rounded-xl p-6">
//                 <div className="space-y-6">
//                   <pre className="text-gray-100 text-sm overflow-x-auto">
// {`// Form Submit Button
// <Button
//   type="submit"
//   variant="primary"
//   loading={isSubmitting}
//   disabled={!isValid || isSubmitting}
//   fullWidth
//   aria-busy={isSubmitting}
//   onClick={handleSubmit}
// >
//   {isSubmitting ? 'Submitting...' : 'Submit Form'}
// </Button>

// // Form Action Group
// <div className="flex gap-3">
//   <Button
//     variant="outline"
//     onClick={handleCancel}
//     disabled={isSubmitting}
//   >
//     Cancel
//   </Button>
//   <Button
//     variant="ghost"
//     onClick={handleSaveDraft}
//     disabled={isSubmitting}
//   >
//     Save Draft
//   </Button>
//   <Button
//     variant="primary"
//     onClick={handlePublish}
//     loading={isPublishing}
//   >
//     Publish
//   </Button>
// </div>`}
//                   </pre>
                  
//                   <pre className="text-gray-100 text-sm overflow-x-auto">
// {`// Multi-step Form Navigation
// <div className="flex justify-between items-center">
//   <Button
//     variant="outline"
//     icon={<ChevronLeft />}
//     disabled={currentStep === 1}
//     onClick={goToPreviousStep}
//   >
//     Previous
//   </Button>
  
//   <span className="text-sm font-medium">
//     Step {currentStep} of {totalSteps}
//   </span>
  
//   <Button
//     variant="primary"
//     icon={<ChevronRight />}
//     iconPosition="right"
//     loading={isSavingStep}
//     disabled={!isStepValid}
//     onClick={goToNextStep}
//   >
//     {currentStep === totalSteps ? 'Finish' : 'Next'}
//   </Button>
// </div>`}
//                   </pre>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* 3. Social Media & Engagement */}
//           <section>
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
//               📱 Social Media & Engagement Buttons
//             </h2>
            
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
//                 <h3 className="text-lg font-semibold mb-4">Like, Share, Follow Actions</h3>
//                 <div className="space-y-6">
//                   {/* Like Button */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <div className="flex items-center gap-4">
//                       <Button
//                         variant="ghost"
//                         icon={liked ? "❤️" : "🤍"}
//                         onClick={() => setLiked(!liked)}
//                         disabled={disabled}
//                         ariaLabel={liked ? "Unlike post" : "Like post"}
//                       >
//                         {liked ? "Liked" : "Like"}
//                       </Button>
//                       <span className="text-sm text-gray-500">
//                         Dynamic icon and text based on state
//                       </span>
//                     </div>
//                   </div>
                  
//                   {/* Share & Follow */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <div className="flex flex-wrap gap-3">
//                       <Button
//                         variant="outline"
//                         icon="💬"
//                         disabled={disabled}
//                       >
//                         Comment
//                       </Button>
//                       <Button
//                         variant="outline"
//                         icon="↗️"
//                         iconPosition="right"
//                         disabled={disabled}
//                       >
//                         Share
//                       </Button>
//                       <Button
//                         variant="primary"
//                         icon="👤"
//                         loading={loading}
//                         disabled={disabled}
//                       >
//                         Follow
//                       </Button>
//                     </div>
//                   </div>
                  
//                   {/* Reaction Buttons */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <div className="flex gap-2">
//                       {['👍', '😍', '😮', '😢', '😡'].map(emoji => (
//                         <Button
//                           key={emoji}
//                           variant="ghost"
//                           icon={emoji}
//                           iconOnly
//                           ariaLabel={`React with ${emoji}`}
//                           disabled={disabled}
//                           className="text-xl"
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="bg-gray-900 rounded-xl p-6">
//                 <div className="space-y-6">
//                   <pre className="text-gray-100 text-sm overflow-x-auto">
// {`// Like Button with State
// <Button
//   variant="ghost"
//   icon={isLiked ? "❤️" : "🤍"}
//   onClick={toggleLike}
//   loading={isTogglingLike}
//   disabled={isDisabled}
//   ariaLabel={isLiked ? "Unlike this post" : "Like this post"}
//   dataTestId="like-button"
// >
//   {isLiked ? "Liked" : "Like"} ({likeCount})
// </Button>

// // Share Button
// <Button
//   variant="outline"
//   icon={<Share2 />}
//   iconPosition="right"
//   onClick={handleShare}
//   ariaLabel="Share this post"
// >
//   Share
// </Button>

// // Reaction Buttons
// <div className="flex gap-2">
//   {reactions.map(reaction => (
//     <Button
//       key={reaction.emoji}
//       variant="ghost"
//       icon={reaction.emoji}
//       iconOnly
//       ariaLabel={\`React with \${reaction.label}\`}
//       onClick={() => handleReaction(reaction.type)}
//       className={\`\${selectedReaction === reaction.type ? 'bg-blue-50' : ''}\`}
//     />
//   ))}
// </div>`}
//                   </pre>
                  
//                   <div className="text-sm text-gray-400">
//                     <div className="font-medium mb-2">Key Features:</div>
//                     <ul className="space-y-1">
//                       <li>• Dynamic icon changes based on state</li>
//                       <li>• Accessible labels for screen readers</li>
//                       <li>• Loading states for API calls</li>
//                       <li>• Icon-only buttons for reactions</li>
//                       <li>• Test IDs for automated testing</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* 4. Dashboard & Admin */}
//           <section>
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
//               🖥️ Dashboard & Admin Panel Buttons
//             </h2>
            
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
//                 <h3 className="text-lg font-semibold mb-4">Admin Actions & Data Operations</h3>
//                 <div className="space-y-6">
//                   {/* Action Grid */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                       <Button variant="outline" icon="📊" fullWidth disabled={disabled}>
//                         Analytics
//                       </Button>
//                       <Button variant="outline" icon="⚙️" fullWidth disabled={disabled}>
//                         Settings
//                       </Button>
//                       <Button variant="outline" icon="📥" fullWidth disabled={disabled}>
//                         Export
//                       </Button>
//                       <Button variant="outline" icon="🔄" fullWidth disabled={disabled}>
//                         Refresh
//                       </Button>
//                     </div>
//                   </div>
                  
//                   {/* Data Table Actions */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <div className="flex flex-wrap gap-3">
//                       <Button variant="outline" icon="➕" disabled={disabled}>
//                         Add New
//                       </Button>
//                       <Button variant="outline" icon="✏️" disabled={disabled}>
//                         Edit
//                       </Button>
//                       <Button variant="danger" icon="🗑️" disabled={disabled}>
//                         Delete
//                       </Button>
//                       <Button variant="ghost" icon="⋯" iconOnly ariaLabel="More actions" disabled={disabled} />
//                     </div>
//                   </div>
                  
//                   {/* Bulk Actions */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm font-medium">3 items selected</span>
//                       <div className="flex gap-2">
//                         <Button variant="outline" size="small" disabled={disabled}>
//                           Export Selected
//                         </Button>
//                         <Button variant="danger" size="small" disabled={disabled}>
//                           Delete Selected
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="bg-gray-900 rounded-xl p-6">
//                 <div className="space-y-6">
//                   <pre className="text-gray-100 text-sm overflow-x-auto">
// {`// Dashboard Action Grid
// <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//   <Button
//     variant="outline"
//     icon={<BarChart2 />}
//     fullWidth
//     onClick={showAnalytics}
//   >
//     Analytics
//   </Button>
//   <Button
//     variant="outline"
//     icon={<Settings />}
//     fullWidth
//     onClick={openSettings}
//   >
//     Settings
//   </Button>
//   <Button
//     variant="outline"
//     icon={<Download />}
//     fullWidth
//     onClick={exportData}
//     loading={isExporting}
//   >
//     Export
//   </Button>
//   <Button
//     variant="outline"
//     icon={<RefreshCw />}
//     fullWidth
//     onClick={refreshData}
//     loading={isRefreshing}
//   >
//     Refresh
//   </Button>
// </div>

// // Data Table Row Actions
// <div className="flex gap-2">
//   <Button
//     variant="outline"
//     size="small"
//     icon={<Edit />}
//     onClick={() => handleEdit(row.id)}
//   >
//     Edit
//   </Button>
//   <Button
//     variant="danger"
//     size="small"
//     icon={<Trash2 />}
//     onClick={() => handleDelete(row.id)}
//     loading={deletingId === row.id}
//   >
//     Delete
//   </Button>
//   <Button
//     variant="ghost"
//     size="small"
//     icon={<MoreHorizontal />}
//     iconOnly
//     ariaLabel="More actions"
//     onClick={(e) => openContextMenu(e, row.id)}
//   />
// </div>`}
//                   </pre>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* 5. Navigation & UI Controls */}
//           <section>
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
//               🧭 Navigation & UI Control Buttons
//             </h2>
            
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
//                 <h3 className="text-lg font-semibold mb-4">Navigation, Pagination & UI Controls</h3>
//                 <div className="space-y-6">
//                   {/* Pagination */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <div className="flex items-center justify-center gap-2">
//                       <Button variant="outline" icon="←" iconOnly ariaLabel="First page" disabled={disabled} />
//                       <Button variant="outline" icon="◀" iconOnly ariaLabel="Previous page" disabled={disabled} />
//                       <Button variant="primary" disabled>1</Button>
//                       <Button variant="outline" disabled={disabled}>2</Button>
//                       <Button variant="outline" disabled={disabled}>3</Button>
//                       <span className="px-2">...</span>
//                       <Button variant="outline" disabled={disabled}>10</Button>
//                       <Button variant="outline" icon="▶" iconOnly ariaLabel="Next page" disabled={disabled} />
//                       <Button variant="outline" icon="→" iconOnly ariaLabel="Last page" disabled={disabled} />
//                     </div>
//                   </div>
                  
//                   {/* Tab Navigation */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <div className="flex border-b">
//                       <Button variant="ghost" className="rounded-none border-b-2 border-blue-500">
//                         Overview
//                       </Button>
//                       <Button variant="ghost" className="rounded-none">
//                         Settings
//                       </Button>
//                       <Button variant="ghost" className="rounded-none">
//                         Billing
//                       </Button>
//                       <Button variant="ghost" className="rounded-none">
//                         Team
//                       </Button>
//                     </div>
//                   </div>
                  
//                   {/* Modal & Dialog Actions */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <div className="flex justify-end gap-3">
//                       <Button variant="outline" disabled={disabled}>
//                         Cancel
//                       </Button>
//                       <Button variant="primary" loading={loading} disabled={disabled}>
//                         Confirm
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="bg-gray-900 rounded-xl p-6">
//                 <div className="space-y-6">
//                   <pre className="text-gray-100 text-sm overflow-x-auto">
// {`// Pagination Component
// <div className="flex items-center gap-2">
//   <Button
//     variant="outline"
//     icon={<ChevronsLeft />}
//     iconOnly
//     ariaLabel="First page"
//     disabled={currentPage === 1}
//     onClick={() => setPage(1)}
//   />
  
//   <Button
//     variant="outline"
//     icon={<ChevronLeft />}
//     iconOnly
//     ariaLabel="Previous page"
//     disabled={currentPage === 1}
//     onClick={() => setPage(prev => prev - 1)}
//   />
  
//   {pageNumbers.map(num => (
//     <Button
//       key={num}
//       variant={currentPage === num ? "primary" : "outline"}
//       onClick={() => setPage(num)}
//     >
//       {num}
//     </Button>
//   ))}
  
//   <Button
//     variant="outline"
//     icon={<ChevronRight />}
//     iconOnly
//     ariaLabel="Next page"
//     disabled={currentPage === totalPages}
//     onClick={() => setPage(prev => prev + 1)}
//   />
  
//   <Button
//     variant="outline"
//     icon={<ChevronsRight />}
//     iconOnly
//     ariaLabel="Last page"
//     disabled={currentPage === totalPages}
//     onClick={() => setPage(totalPages)}
//   />
// </div>

// // Modal Footer Actions
// <div className="flex justify-end gap-3">
//   <Button
//     variant="outline"
//     onClick={onClose}
//     disabled={isSubmitting}
//   >
//     Cancel
//   </Button>
//   <Button
//     variant="primary"
//     onClick={handleConfirm}
//     loading={isSubmitting}
//     disabled={!isValid}
//   >
//     {isSubmitting ? 'Saving...' : 'Save Changes'}
//   </Button>
// </div>`}
//                   </pre>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* 6. Specialized Button Patterns */}
//           <section>
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
//               ⚡ Specialized Button Patterns
//             </h2>
            
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
//                 <h3 className="text-lg font-semibold mb-4">Advanced Button Patterns</h3>
//                 <div className="space-y-6">
//                   {/* Loading with Progress */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <Button
//                       loading={loading}
//                       disabled={disabled}
//                       fullWidth
//                       renderLoading={() => (
//                         <div className="flex items-center gap-3">
//                           <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//                           <span>Uploading 65%...</span>
//                         </div>
//                       )}
//                     >
//                       Upload File
//                     </Button>
//                   </div>
                  
//                   {/* Split Button */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <div className="flex">
//                       <Button variant="primary" disabled={disabled} className="rounded-r-none flex-1">
//                         Export Data
//                       </Button>
//                       <Button variant="primary" icon="▼" iconOnly disabled={disabled} className="rounded-l-none border-l" />
//                     </div>
//                   </div>
                  
//                   {/* Toggle Button */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <div className="flex rounded-lg border w-fit">
//                       <Button variant="ghost" className="rounded-none rounded-l-lg border-r">
//                         List
//                       </Button>
//                       <Button variant="primary" className="rounded-none">
//                         Grid
//                       </Button>
//                       <Button variant="ghost" className="rounded-none rounded-r-lg border-l">
//                         Map
//                       </Button>
//                     </div>
//                   </div>
                  
//                   {/* Floating Action Button */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg relative h-32">
//                     <Button
//                       variant="primary"
//                       icon="+"
//                       iconOnly
//                       className="absolute bottom-4 right-4 rounded-full w-12 h-12 shadow-xl"
//                       ariaLabel="Add new item"
//                       disabled={disabled}
//                     />
//                   </div>
//                 </div>
//               </div>
              
//               <div className="bg-gray-900 rounded-xl p-6">
//                 <div className="space-y-6">
//                   <pre className="text-gray-100 text-sm overflow-x-auto">
// {`// Custom Loading State
// <Button
//   loading={isUploading}
//   disabled={isDisabled}
//   fullWidth
//   renderLoading={() => (
//     <div className="flex items-center gap-3">
//       <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//       <span>Uploading {progress}%...</span>
//     </div>
//   )}
//   onClick={handleUpload}
// >
//   Upload File
// </Button>

// // Split Button with Dropdown
// <div className="flex">
//   <Button
//     variant="primary"
//     onClick={handleExport}
//     className="rounded-r-none flex-1"
//   >
//     Export Data
//   </Button>
//   <Button
//     variant="primary"
//     icon={<ChevronDown />}
//     iconOnly
//     className="rounded-l-none border-l"
//     onClick={toggleExportOptions}
//     ariaLabel="Export options"
//   />
// </div>

// // View Toggle
// <div className="flex rounded-lg border w-fit">
//   <Button
//     variant={view === 'list' ? 'primary' : 'ghost'}
//     onClick={() => setView('list')}
//     className="rounded-none rounded-l-lg border-r"
//   >
//     List
//   </Button>
//   <Button
//     variant={view === 'grid' ? 'primary' : 'ghost'}
//     onClick={() => setView('grid')}
//     className="rounded-none"
//   >
//     Grid
//   </Button>
//   <Button
//     variant={view === 'map' ? 'primary' : 'ghost'}
//     onClick={() => setView('map')}
//     className="rounded-none rounded-r-lg border-l"
//   >
//     Map
//   </Button>
// </div>`}
//                   </pre>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* 7. Accessibility Examples */}
//           <section>
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
//               ♿ Accessibility-First Buttons
//             </h2>
            
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
//                 <h3 className="text-lg font-semibold mb-4">WCAG Compliant Examples</h3>
//                 <div className="space-y-6">
//                   {/* Icon-only with proper labels */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <div className="flex gap-3">
//                       <Button
//                         icon="🔍"
//                         iconOnly
//                         ariaLabel="Search products"
//                         disabled={disabled}
//                       />
//                       <Button
//                         icon="⚙️"
//                         iconOnly
//                         ariaLabel="Settings menu"
//                         disabled={disabled}
//                       />
//                       <Button
//                         icon="👤"
//                         iconOnly
//                         ariaLabel="User profile"
//                         disabled={disabled}
//                       />
//                       <Button
//                         icon="🔔"
//                         iconOnly
//                         ariaLabel="Notifications (3 unread)"
//                         disabled={disabled}
//                       />
//                     </div>
//                     <div className="mt-2 text-sm text-gray-500">
//                       All icon-only buttons have aria-label
//                     </div>
//                   </div>
                  
//                   {/* Loading with aria-busy */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <Button
//                       loading={loading}
//                       disabled={disabled}
//                       aria-busy={loading}
//                     >
//                       {loading ? 'Processing...' : 'Submit Payment'}
//                     </Button>
//                     <div className="mt-2 text-sm text-gray-500">
//                       aria-busy indicates loading to screen readers
//                     </div>
//                   </div>
                  
//                   {/* Keyboard navigation */}
//                   <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                     <div className="flex gap-3">
//                       <Button variant="outline" disabled={disabled}>
//                         ← Tab
//                       </Button>
//                       <Button variant="outline" disabled={disabled}>
//                         Enter ↵
//                       </Button>
//                       <Button variant="outline" disabled={disabled}>
//                         Space ␣
//                       </Button>
//                     </div>
//                     <div className="mt-2 text-sm text-gray-500">
//                       All buttons are keyboard accessible
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="bg-gray-900 rounded-xl p-6">
//                 <pre className="text-gray-100 text-sm overflow-x-auto">
// {`// Icon-only with accessibility
// <Button
//   icon={<Search />}
//   iconOnly
//   ariaLabel="Search products"
//   onClick={openSearch}
//   dataTestId="search-button"
// />

// <Button
//   icon={<Settings />}
//   iconOnly
//   ariaLabel="Settings menu"
//   onClick={openSettings}
//   aria-haspopup="menu"
// />

// <Button
//   icon={<Bell />}
//   iconOnly
//   ariaLabel={\`Notifications (\${unreadCount} unread)\`}
//   onClick={openNotifications}
// />

// // Loading with screen reader support
// <Button
//   loading={isProcessing}
//   disabled={isProcessing}
//   aria-busy={isProcessing}
//   aria-live="polite"
//   onClick={processPayment}
// >
//   {isProcessing ? 'Processing payment...' : 'Pay $49.99'}
// </Button>

// // Focus management
// <Button
//   ref={buttonRef}
//   variant="primary"
//   onClick={handleClick}
//   onKeyDown={(e) => {
//     if (e.key === 'Enter' || e.key === ' ') {
//       handleClick();
//     }
//   }}
//   aria-label="Submit form (press Enter or Space)"
// >
//   Submit
// </Button>`}
//                 </pre>
//               </div>
//             </div>
//           </section>
//         </div>

//         {/* Footer Summary */}
//         <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl">
//           <div className="text-center">
//             <h3 className="text-xl font-bold mb-4">📊 Usage Summary</h3>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
//                 <div className="text-2xl font-bold">7</div>
//                 <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
//               </div>
//               <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
//                 <div className="text-2xl font-bold">25+</div>
//                 <div className="text-sm text-gray-600 dark:text-gray-400">Examples</div>
//               </div>
//               <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
//                 <div className="text-2xl font-bold">100%</div>
//                 <div className="text-sm text-gray-600 dark:text-gray-400">Accessible</div>
//               </div>
//               <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
//                 <div className="text-2xl font-bold">12</div>
//                 <div className="text-sm text-gray-600 dark:text-gray-400">Variants</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Buttons;