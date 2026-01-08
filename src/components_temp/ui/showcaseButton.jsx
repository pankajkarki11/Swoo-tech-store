// // src/pages/ButtonShowcase.jsx
// import React, { useState } from 'react';
// import Button from './Button';
// import {
//   ShoppingCart,
//   Check,
//   ArrowRight,
//   Heart,
//   Star,
//   Settings,
//   Download,
//   Bell,
//   MessageCircle,
//   ThumbsUp,
//   Share2,
//   Code, 
//   Rocket, 
//   Crown, 
//   Globe,
//   Activity,
//   AlertTriangle,
//   CheckCircle,
// } from 'lucide-react';

// const ButtonShowcase = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isDisabled, setIsDisabled] = useState(false);
//   const [likeCount, setLikeCount] = useState(42);
//   const [isLiked, setIsLiked] = useState(false);
//   const [cartCount, setCartCount] = useState(3);
//   const [activeVariant, setActiveVariant] = useState('primary');
//   const [activeSize, setActiveSize] = useState('medium');

//   const handleLoad = () => {
//     setIsLoading(true);
//     setTimeout(() => setIsLoading(false), 2000);
//   };

//   const toggleLike = () => {
//     setIsLiked(!isLiked);
//     setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
//   };

//   const addToCart = () => {
//     setCartCount(prev => prev + 1);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto">
        
//         {/* Header */}
//         <header className="mb-12 text-center">
//           <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
//             Ultimate Button Component Showcase
//           </h1>
//           <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
//             Every possible button use case demonstrated with our advanced Button component.
//             Copy-paste ready examples for your projects.
//           </p>
//         </header>

//         {/* Controls Panel */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
//           <h2 className="text-2xl font-bold mb-4">Live Controls</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">Variant</label>
//               <select 
//                 className="w-full p-2 border rounded-lg"
//                 value={activeVariant}
//                 onChange={(e) => setActiveVariant(e.target.value)}
//               >
//                 <option value="primary">Primary</option>
//                 <option value="secondary">Secondary</option>
//                 <option value="danger">Danger</option>
//                 <option value="success">Success</option>
//                 <option value="outline">Outline</option>
//                 <option value="ghost">Ghost</option>
//                 <option value="teal">Teal Gradient</option>
//                 <option value="cart">Cart Style</option>
//                 <option value="overlay">Overlay</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">Size</label>
//               <select 
//                 className="w-full p-2 border rounded-lg"
//                 value={activeSize}
//                 onChange={(e) => setActiveSize(e.target.value)}
//               >
//                 <option value="small">Small</option>
//                 <option value="medium">Medium</option>
//                 <option value="large">Large</option>
//                 <option value="xlarge">X-Large</option>
//                 <option value="addcart">Add Cart</option>
//               </select>
//             </div>
//             <div className="flex items-center space-x-4">
//               <Button 
//                 variant="outline"
//                 onClick={() => setIsDisabled(!isDisabled)}
//               >
//                 {isDisabled ? 'Enable All' : 'Disable All'}
//               </Button>
//               <Button 
//                 variant="outline"
//                 onClick={handleLoad}
//                 loading={isLoading}
//               >
//                 {isLoading ? 'Loading...' : 'Load Demo'}
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Main Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
//           {/* Left Column - Basic to Advanced */}
//           <div className="space-y-8">
            
//             {/* Section 1: Basic Variants */}
//             <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//                 <Check className="text-green-500" />
//                 Basic Button Variants
//               </h2>
              
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 <Button variant="primary" disabled={isDisabled}>
//                   Primary
//                 </Button>
                
//                 <Button variant="secondary" disabled={isDisabled}>
//                   Secondary
//                 </Button>
                
//                 <Button variant="danger" disabled={isDisabled}>
//                   Danger
//                 </Button>
                
//                 <Button variant="success" disabled={isDisabled}>
//                   Success
//                 </Button>
                
//                 <Button variant="outline" disabled={isDisabled}>
//                   Outline
//                 </Button>
                
//                 <Button variant="ghost" disabled={isDisabled}>
//                   Ghost
//                 </Button>
//               </div>
              
//               <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Button variant="teal" disabled={isDisabled}>
//                   Teal Gradient
//                 </Button>
                
//                 <Button variant="cart" disabled={isDisabled}>
//                   Cart Style
//                 </Button>
                
//                 <Button variant="overlay" disabled={isDisabled}>
//                   Overlay Button
//                 </Button>
//               </div>
//             </section>

//             {/* Section 2: Sizes */}
//             <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//                 <ArrowsUpDown className="text-blue-500" />
//                 All Size Variants
//               </h2>
              
//               <div className="space-y-4">
//                 <div className="flex items-center gap-4">
//                   <span className="w-24 text-sm font-medium">Small:</span>
//                   <Button size="small" variant={activeVariant} disabled={isDisabled}>
//                     Small Button
//                   </Button>
//                 </div>
                
//                 <div className="flex items-center gap-4">
//                   <span className="w-24 text-sm font-medium">Medium:</span>
//                   <Button size="medium" variant={activeVariant} disabled={isDisabled}>
//                     Medium Button
//                   </Button>
//                 </div>
                
//                 <div className="flex items-center gap-4">
//                   <span className="w-24 text-sm font-medium">Large:</span>
//                   <Button size="large" variant={activeVariant} disabled={isDisabled}>
//                     Large Button
//                   </Button>
//                 </div>
                
//                 <div className="flex items-center gap-4">
//                   <span className="w-24 text-sm font-medium">X-Large:</span>
//                   <Button size="xlarge" variant={activeVariant} disabled={isDisabled}>
//                     Extra Large Button
//                   </Button>
//                 </div>
                
//                 <div className="flex items-center gap-4">
//                   <span className="w-24 text-sm font-medium">Add Cart:</span>
//                   <Button size="addcart" variant={activeVariant} disabled={isDisabled}>
//                     Add to Cart Size
//                   </Button>
//                 </div>
//               </div>
//             </section>

//             {/* Section 3: Icon Usage */}
//             <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//                 <Star className="text-yellow-500" />
//                 Icon Combinations
//               </h2>
              
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 {/* Left Icon */}
//                 <Button icon={<ShoppingCart />} variant="primary" disabled={isDisabled}>
//                   Add to Cart
//                 </Button>
                
//                 {/* Right Icon */}
//                 <Button 
//                   icon={<ArrowRight />} 
//                   iconPosition="right" 
//                   variant="secondary"
//                   disabled={isDisabled}
//                 >
//                   Continue
//                 </Button>
                
//                 {/* Loading with Icon */}
//                 <Button 
//                   icon={<Download />}
//                   loading={isLoading}
//                   onClick={handleLoad}
//                   disabled={isDisabled}
//                 >
//                   Download
//                 </Button>
                
//                 {/* Icon Only */}
//                 <Button 
//                   icon={<Settings />}
//                   iconOnly
//                   ariaLabel="Settings"
//                   variant="ghost"
//                   disabled={isDisabled}
//                 />
                
//                 {/* Double Icon */}
//                 <Button 
//                   icon={<ThumbsUp />}
//                   iconPosition="right"
//                   variant="outline"
//                   disabled={isDisabled}
//                 >
//                   Like
//                 </Button>
                
//                 {/* Animated Icon */}
//                 <Button 
//                   icon={<Heart className={isLiked ? "fill-red-500 text-red-500" : ""} />}
//                   variant="ghost"
//                   onClick={toggleLike}
//                   disabled={isDisabled}
//                 >
//                   {likeCount}
//                 </Button>
//               </div>
//             </section>

//             {/* Section 4: Loading & States */}
//             <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//                 <Activity className="text-purple-500" />
//                 State Management
//               </h2>
              
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <Button loading disabled={isDisabled}>
//                   Loading
//                 </Button>
                
//                 <Button disabled={true}>
//                   Disabled
//                 </Button>
                
//                 <Button 
//                   loading={isLoading}
//                   onClick={handleLoad}
//                   disabled={isDisabled}
//                 >
//                   {isLoading ? 'Processing' : 'Start Process'}
//                 </Button>
                
//                 <Button 
//                   disabled={isDisabled}
//                   icon={<Check />}
//                   iconPosition="right"
//                 >
//                   Complete
//                 </Button>
//               </div>
//             </section>

//             {/* Section 5: Width & Layout */}
//             <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//                 <Expand className="text-orange-500" />
//                 Width & Layout Options
//               </h2>
              
//               <div className="space-y-4">
//                 <Button fullWidth variant="primary" disabled={isDisabled}>
//                   Full Width Button
//                 </Button>
                
//                 <div className="flex gap-4">
//                   <Button variant="outline" disabled={isDisabled}>
//                     Cancel
//                   </Button>
//                   <Button variant="primary" disabled={isDisabled}>
//                     Save
//                   </Button>
//                 </div>
                
//                 <div className="grid grid-cols-3 gap-4">
//                   <Button variant="ghost" disabled={isDisabled}>
//                     Previous
//                   </Button>
//                   <Button variant="outline" disabled={isDisabled}>
//                     Current
//                   </Button>
//                   <Button variant="primary" disabled={isDisabled}>
//                     Next
//                   </Button>
//                 </div>
//               </div>
//             </section>

//           </div>

//           {/* Right Column - Advanced Features */}
//           <div className="space-y-8">
            
//             {/* Section 6: Advanced Composition */}
//             <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//                 <Code className="text-green-500" />
//                 Advanced Component Composition
//               </h2>
              
//               <div className="space-y-4">
//                 {/* Render as Link */}
//                 <Button 
//                   as="a"
//                   href="#"
//                   variant="outline"
//                   icon={<ExternalLink />}
//                   disabled={isDisabled}
//                 >
//                   Render as Link
//                 </Button>
                
//                 {/* Render as Div with role */}
//                 <Button 
//                   as="div"
//                   role="button"
//                   tabIndex={0}
//                   onClick={() => alert('Div as button clicked!')}
//                   variant="ghost"
//                   disabled={isDisabled}
//                 >
//                   Div as Button
//                 </Button>
                
//                 {/* Compound Components */}
//                 <Button variant="outline" disabled={isDisabled}>
//                   <Button.Icon className="text-blue-500">
//                     <CheckCircle />
//                   </Button.Icon>
//                   <Button.Text className="ml-2 font-semibold">
//                     Compound Component
//                   </Button.Text>
//                 </Button>
//               </div>
//             </section>

//             {/* Section 7: Custom Render Props */}
//             <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//                 <Wrench className="text-red-500" />
//                 Custom Render Functions
//               </h2>
              
//               <div className="space-y-4">
//                 {/* Custom Icon Render */}
//                 <Button
//                   renderIcon={() => (
//                     <div className="relative">
//                       <Bell />
//                       <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
//                     </div>
//                   )}
//                   variant="ghost"
//                   disabled={isDisabled}
//                 >
//                   Notifications
//                 </Button>
                
//                 {/* Custom Loading Render */}
//                 <Button
//                   loading={isLoading}
//                   renderLoading={() => (
//                     <div className="flex items-center gap-2">
//                       <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                       <span>Custom Loading...</span>
//                     </div>
//                   )}
//                   onClick={handleLoad}
//                   disabled={isDisabled}
//                 >
//                   Load Data
//                 </Button>
                
//                 {/* Custom Children Render */}
//                 <Button
//                   renderChildren={() => (
//                     <div className="flex flex-col items-center">
//                       <span className="font-bold">Special Offer</span>
//                       <span className="text-xs opacity-75">50% OFF</span>
//                     </div>
//                   )}
//                   variant="teal"
//                   disabled={isDisabled}
//                 />
//               </div>
//             </section>

//             {/* Section 8: Slot Props */}
//             <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//                 <Package className="text-purple-500" />
//                 Slot Props Usage
//               </h2>
              
//               <div className="space-y-4">
//                 {/* Icon Slot */}
//                 <Button
//                   iconSlot={
//                     <div className="relative">
//                       <ShoppingCart />
//                       <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                         {cartCount}
//                       </span>
//                     </div>
//                   }
//                   onClick={addToCart}
//                   variant="cart"
//                   disabled={isDisabled}
//                 >
//                   Cart ({cartCount})
//                 </Button>
                
//                 {/* Content Slot */}
//                 <Button
//                   contentSlot={
//                     <div className="flex flex-col items-start">
//                       <span className="font-bold">Premium Plan</span>
//                       <span className="text-sm opacity-75">$29.99/month</span>
//                     </div>
//                   }
//                   icon={<Crown className="text-yellow-500" />}
//                   variant="outline"
//                   disabled={isDisabled}
//                 />
                
//                 {/* Loading Slot */}
//                 <Button
//                   loadingSlot={
//                     <div className="flex items-center">
//                       <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                       <span>Processing...</span>
//                     </div>
//                   }
//                   loading={isLoading}
//                   onClick={handleLoad}
//                   variant="primary"
//                   disabled={isDisabled}
//                 />
//               </div>
//             </section>

//             {/* Section 9: Style Injection */}
//             <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//                 <Palette className="text-pink-500" />
//                 Dynamic Style Injection
//               </h2>
              
//               <div className="space-y-4">
//                 {/* Inline Styles */}
//                 <Button
//                   style={{
//                     background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
//                     boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
//                   }}
//                   disabled={isDisabled}
//                 >
//                   Inline Styled
//                 </Button>
                
//                 {/* Override Styles */}
//                 <Button
//                   overrideStyles={{
//                     transform: 'skewX(-10deg)',
//                     border: '2px dashed #3B82F6',
//                   }}
//                   variant="outline"
//                   disabled={isDisabled}
//                 >
//                   Skewed Style
//                 </Button>
//               </div>
//             </section>

//             {/* Section 10: Theme Customization */}
//             <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//                 <Brush className="text-cyan-500" />
//                 Theme Customization
//               </h2>
              
//               <div className="space-y-4">
//                 <Button
//                   variant="custom"
//                   theme={{
//                     variants: {
//                       custom: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all"
//                     },
//                     sizes: {
//                       large: "px-12 py-4 text-xl font-bold"
//                     }
//                   }}
//                   size="large"
//                   icon={<Rocket />}
//                   disabled={isDisabled}
//                 >
//                   Themed Button
//                 </Button>
//               </div>
//             </section>

//             {/* Section 11: Complete Override */}
//             <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//                 <AlertTriangle className="text-red-500" />
//                 Complete Default Override
//               </h2>
              
//               <div className="space-y-4">
//                 <Button
//                   __dangerouslyDisableDefaults
//                   className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-bold"
//                   disabled={isDisabled}
//                 >
//                   No Default Styles
//                 </Button>
                
//                 <Button
//                   baseClassName="border-2 border-dashed border-purple-500"
//                   variantClassName="bg-transparent text-purple-500 hover:bg-purple-50"
//                   sizeClassName="px-8 py-3 text-lg"
//                   disabled={isDisabled}
//                 >
//                   Partial Override
//                 </Button>
//               </div>
//             </section>

//             {/* Section 12: Real-world Examples */}
//             <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//                 <Globe className="text-blue-500" />
//                 Real-World Use Cases
//               </h2>
              
//               <div className="space-y-4">
//                 {/* E-commerce Add to Cart */}
//                 <Button
//                   variant="cart"
//                   size="addcart"
//                   icon={<ShoppingCart />}
//                   loading={isLoading}
//                   onClick={handleLoad}
//                   disabled={isDisabled}
//                   fullWidth
//                 >
//                   {isDisabled ? 'Out of Stock' : 'Add to Cart - $49.99'}
//                 </Button>
                
//                 {/* Social Media Actions */}
//                 <div className="flex gap-2">
//                   <Button
//                     icon={<ThumbsUp className={isLiked ? "fill-blue-500 text-blue-500" : ""} />}
//                     variant="ghost"
//                     onClick={toggleLike}
//                     disabled={isDisabled}
//                   >
//                     {likeCount}
//                   </Button>
                  
//                   <Button
//                     icon={<MessageCircle />}
//                     variant="ghost"
//                     disabled={isDisabled}
//                   >
//                     24
//                   </Button>
                  
//                   <Button
//                     icon={<Share2 />}
//                     variant="ghost"
//                     disabled={isDisabled}
//                   >
//                     Share
//                   </Button>
//                 </div>
                
//                 {/* Form Actions */}
//                 <div className="flex gap-2">
//                   <Button
//                     variant="outline"
//                     disabled={isDisabled}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     type="submit"
//                     variant="primary"
//                     loading={isLoading}
//                     disabled={isDisabled}
//                     fullWidth
//                   >
//                     Save Changes
//                   </Button>
//                 </div>
//               </div>
//             </section>

//           </div>
//         </div>

//         {/* Code Examples */}
//         <section className="mt-12 bg-gray-900 rounded-2xl shadow-xl p-6">
//           <h2 className="text-2xl font-bold text-white mb-6">Code Examples</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Basic Example */}
//             <div>
//               <h3 className="text-lg font-semibold text-white mb-2">Basic Button</h3>
//               <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto text-sm">
// {`<Button variant="primary">
//   Click Me
// </Button>`}
//               </pre>
//             </div>
            
//             {/* Icon Button Example */}
//             <div>
//               <h3 className="text-lg font-semibold text-white mb-2">Icon Button</h3>
//               <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto text-sm">
// {`<Button 
//   icon={<ShoppingCart />}
//   variant="cart"
//   loading={isLoading}
// >
//   Add to Cart
// </Button>`}
//               </pre>
//             </div>
            
//             {/* Advanced Example */}
//             <div className="md:col-span-2">
//               <h3 className="text-lg font-semibold text-white mb-2">Advanced Usage</h3>
//               <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto text-sm">
// {`<Button
//   as="a"
//   href="/dashboard"
//   variant="outline"
//   icon={<ArrowRight />}
//   iconPosition="right"
//   fullWidth
//   loading={isLoading}
//   disabled={isDisabled}
//   dataTestId="dashboard-button"
//   ariaLabel="Go to Dashboard"
//   onClick={() => console.log('Clicked')}
// >
//   Go to Dashboard
// </Button>`}
//               </pre>
//             </div>
//           </div>
//         </section>

//         {/* Footer */}
//         <footer className="mt-12 text-center text-gray-600 dark:text-gray-400">
//           <p className="mb-4">
//             This showcase demonstrates <strong>{Object.keys(Button.propTypes).length}</strong> different props
//             and combinations available in our Button component.
//           </p>
//           <div className="flex flex-wrap justify-center gap-4 text-sm">
//             <span>✅ 100% Accessible</span>
//             <span>🎨 Fully Customizable</span>
//             <span>⚡ Performance Optimized</span>
//             <span>📱 Mobile Responsive</span>
//             <span>🌙 Dark Mode Ready</span>
//           </div>
//         </footer>

//       </div>
//     </div>
//   );
// };

// // Helper icons for the showcase
// const ExternalLink = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//   </svg>
// );

// const ArrowsUpDown = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
//   </svg>
// );

// const Expand = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
//   </svg>
// );

// const Wrench = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//   </svg>
// );

// const Package = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
//   </svg>
// );

// const Palette = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
//   </svg>
// );

// const Brush = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
//   </svg>
// );

// export default ButtonShowcase;