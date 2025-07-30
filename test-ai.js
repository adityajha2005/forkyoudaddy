// Simple test script for AI integration
// Run this in the browser console

console.log('🤖 Testing AI Integration...');

// Test 1: Check if environment variables are loaded
console.log('Environment check:');
console.log('VITE_HUGGINGFACE_API_KEY:', import.meta.env.VITE_HUGGINGFACE_API_KEY ? '✅ Loaded' : '❌ Not found');
console.log('VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? '✅ Loaded' : '❌ Not found');

// Test 2: Test text generation
const testTextGeneration = async () => {
  try {
    console.log('\n📝 Testing text generation...');
    const { generateContentSuggestions } = await import('./src/services/aiService.js');
    
    const result = await generateContentSuggestions(
      "Create a Web3 meme about gas fees", 
      'text'
    );
    
    console.log('Text generation result:', result);
    return result.success;
  } catch (error) {
    console.error('❌ Text generation failed:', error);
    return false;
  }
};

// Test 3: Test image generation
const testImageGeneration = async () => {
  try {
    console.log('\n🎨 Testing image generation...');
    const { generateImageFromPrompt } = await import('./src/services/aiService.js');
    
    const result = await generateImageFromPrompt("A cyberpunk cat meme");
    
    console.log('Image generation result:', result);
    return result.success;
  } catch (error) {
    console.error('❌ Image generation failed:', error);
    return false;
  }
};

// Test 4: Test content categorization
const testCategorization = async () => {
  try {
    console.log('\n🏷️ Testing content categorization...');
    const { categorizeContent } = await import('./src/services/aiService.js');
    
    const categories = await categorizeContent("How to build a Web3 dApp");
    
    console.log('Categorization result:', categories);
    return categories.length > 0;
  } catch (error) {
    console.error('❌ Categorization failed:', error);
    return false;
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('\n🚀 Running all AI tests...\n');
  
  const textResult = await testTextGeneration();
  const imageResult = await testImageGeneration();
  const categoryResult = await testCategorization();
  
  console.log('\n📊 Test Results:');
  console.log('Text Generation:', textResult ? '✅ PASS' : '❌ FAIL');
  console.log('Image Generation:', imageResult ? '✅ PASS' : '❌ FAIL');
  console.log('Categorization:', categoryResult ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = textResult && imageResult && categoryResult;
  console.log('\n🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  if (allPassed) {
    console.log('🎉 AI integration is working perfectly!');
  } else {
    console.log('🔧 Check your API keys and network connection');
  }
};

// Export for browser console
window.testAI = runAllTests;
console.log('\n💡 Run testAI() in the console to test all AI features'); 