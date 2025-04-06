// CanvasDisplay.js
const CanvasOrientation = (function() {
    // Private variables
    let canvas;
    let context;
    let currentOrientation = 'landscape'; // default
    let originalWidth, originalHeight;

    // Public methods
    return {
        /**
         * Initialize the canvas
         * @param {HTMLCanvasElement} canvasElement - The canvas element to control
         */
        init: function(canvasElement) {
            canvas = canvasElement;
            context = canvas.getContext('2d');
            originalWidth = canvas.width;
            originalHeight = canvas.height;
        },

        /**
         * Set canvas orientation
         * @param {string} orientation - 'portrait' or 'landscape'
         */
        setOrientation: function(orientation) {
            if (!canvas) {
                console.error('Canvas not initialized. Call init() first.');
                return;
            }

            currentOrientation = orientation;
            
            if (orientation === 'portrait') {
                // Swap width and height for portrait mode
                canvas.width = originalHeight;
                canvas.height = originalWidth;
                
                // Rotate and translate the context
                context.save();
                context.translate(canvas.width / 2, canvas.height / 2);
                context.rotate(Math.PI / 2);
                context.translate(-originalWidth / 2, -originalHeight / 2);
            } else {
                // Reset to landscape (original dimensions)
                canvas.width = originalWidth;
                canvas.height = originalHeight;
                
                // Reset any previous transformations
                context.restore();
            }
        },

        /**
         * Get current orientation
         * @returns {string} Current orientation ('portrait' or 'landscape')
         */
        getOrientation: function() {
            return currentOrientation;
        },

        /**
         * Get the drawing context with correct orientation
         * @returns {CanvasRenderingContext2D} The drawing context
         */
        getContext: function() {
            return context;
        },

        /**
         * Reset canvas to original state
         */
        reset: function() {
            this.setOrientation('landscape');
        }
    };
})();

// Export for Node.js or module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CanvasOrientation;
}