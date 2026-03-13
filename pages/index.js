   import React, { useState } from 'react';                                                                                                                      
   import products from '../products.json';                                                                                                                      
                                                                                                                                                                 
   const HomePage = () => {                                                                                                                                      
       const [loading, setLoading] = useState(false);                                                                                                            
                                                                                                                                                                 
       const handleBuyClick = async (productId) => {                                                                                                             
           setLoading(true);                                                                                                                                     
           try {                                                                                                                                                 
               const response = await fetch('/api/create-checkout-session', {                                                                                    
                   method: 'POST',                                                                                                                               
                   headers: { 'Content-Type': 'application/json' },                                                                                              
                   body: JSON.stringify({ productId: productId, quantity: 1 }),                                                                                  
               });                                                                                                                                               
                                                                                                                                                                 
               if (!response.ok) {                                                                                                                               
                   const errorBody = await response.json();                                                                                                      
                   throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);                                                              
               }                                                                                                                                                 
                                                                                                                                                                 
               const { url } = await response.json();                                                                                                            
               window.location.href = url;                                                                                                                       
                                                                                                                                                                 
           } catch (error) {                                                                                                                                     
               console.error("Failed to create Stripe session:", error);                                                                                         
               alert(`Error: ${error.message}`);                                                                                                              
               setLoading(false);                                                                                                                                
           }                                                                                                                                                     
       };                                                                                                                                                        
                                                                                                                                                                 
       return (                                                                                                                                                  
           <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>                                                      
               <h1>Nuestra Colección</h1>                                                                                                                        
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>                                       
                   {products.map(product => (                                                                                                                    
                       <div key={product.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>                    
                           <img src={product.image_url} alt={product.title} style={{ width: '100%', height: '250px', objectFit: 'contain' }} />                  
                           <h2>{product.title}</h2>                                                                                                              
                           <p>por {product.author}</p>                                                                                                           
                           <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>                                                                                 
                               $S{(product.price_cents / 100).toFixed(2)}                                                                                       
                           </p>                                                                                                                                  
                           <button                                                                                                                               
                               onClick={() => handleBuyClick(product.id)}                                                                                        
                               disabled={loading}                                                                                                                
                               style={{ padding: '10px 20px', fontSize: '1em', cursor: 'pointer', background: loading ? '#ccc' : '#0070f3', color: 'white',      
 border: 'none', borderRadius: '5px' }}                                                                                                                          
                           >                                                                                                                                     
                               {loading ? 'Procesando...' : 'Comprar Ahora'}                                                                                     
                           </button>                                                                                                                             
                       </div>                                                                                                                                    
                   ))}                                                                                                                                           
               </div>                                                                                                                                            
           </div>                                                                                                                                                
       );                                                                                                                                                        
   };                                                                                                                                                            
                                                                                                                                                                 
   export default HomePage;                                                                                                                                      
   EOL

