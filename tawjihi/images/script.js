// Field coefficients (weights for each subject)
const coefficients = {
    math: {
        'math-math-grade': 4,
        'math-physics-grade': 3,
        'math-arabic-grade': 2,
        'math-science-grade': 2,
        'math-islamics-grade': 1,
        'math-history-geo-grade': 1,
        'math-english-grade': 2,
        'math-french-grade': 2,
        'math-philo-grade': 1
    },
    science: {
        'science-science-grade': 4,
        'science-physics-grade': 3,
        'science-arabic-grade': 2,
        'science-math-grade': 2,
        'science-islamics-grade': 1,
        'science-history-geo-grade': 1,
        'science-english-grade': 2,
        'science-french-grade': 2,
        'science-philo-grade': 1
    },
    tech: {
        'tech-tech-grade': 4,
        'tech-physics-grade': 3,
        'tech-arabic-grade': 2,
        'tech-math-grade': 2,
        'tech-islamics-grade': 1,
        'tech-history-geo-grade': 1,
        'tech-english-grade': 2,
        'tech-french-grade': 2,
        'tech-philo-grade': 1
    }
};

// Calculate average based on user inputs
function calculateAverage(field) {
    let totalScore = 0;
    let totalCoefficient = 0;
    let hasError = false;
    
    // Get coefficients for the selected field
    const fieldCoefficients = coefficients[field];
    
    // Validate and calculate
    for (const [inputId, coefficient] of Object.entries(fieldCoefficients)) {
        const input = document.getElementById(inputId);
        const value = parseFloat(input.value);
        
        // Clear previous errors
        const errorSpan = input.parentElement.querySelector('.error-message');
        errorSpan.style.display = 'none';
        errorSpan.textContent = '';
        
        // Validate input
        if (isNaN(value)) {
            errorSpan.textContent = 'الرجاء إدخال درجة صحيحة';
            errorSpan.style.display = 'block';
            hasError = true;
        } else if (value < 0 || value > 20) {
            errorSpan.textContent = 'يجب أن تكون الدرجة بين 0 و 20';
            errorSpan.style.display = 'block';
            hasError = true;
        } else {
            totalScore += value * coefficient;
            totalCoefficient += coefficient;
        }
    }
    
    if (hasError) return;
    
    // Calculate and display result
    const average = totalScore / totalCoefficient;
    document.getElementById('calculatedAverage').textContent = average.toFixed(2);
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
    
    // Save calculator state
    localStorage.setItem('calculatorState', field + 'Subjects');
}

// Reset form
function resetForm() {
    // Clear all inputs and errors
    document.querySelectorAll('.grade-input').forEach(input => {
        input.value = '';
        const errorSpan = input.parentElement.querySelector('.error-message');
        errorSpan.style.display = 'none';
        errorSpan.textContent = '';
    });
    
    // Hide result
    document.getElementById('resultSection').style.display = 'none';
}

// Initialize sample data
function initSampleData() {
    // Sample data for math
    document.getElementById('math-math-grade').value = '17.5';
    document.getElementById('math-physics-grade').value = '16.25';
    document.getElementById('math-arabic-grade').value = '14.75';
    document.getElementById('math-science-grade').value = '15.5';
    document.getElementById('math-islamics-grade').value = '16.0';
    document.getElementById('math-history-geo-grade').value = '13.75';
    document.getElementById('math-english-grade').value = '18.0';
    document.getElementById('math-french-grade').value = '17.25';
    document.getElementById('math-philo-grade').value = '15.5';
    
    // Sample data for science
    document.getElementById('science-science-grade').value = '16.75';
    document.getElementById('science-physics-grade').value = '15.25';
    document.getElementById('science-arabic-grade').value = '14.0';
    document.getElementById('science-math-grade').value = '15.75';
    document.getElementById('science-islamics-grade').value = '17.0';
    document.getElementById('science-history-geo-grade').value = '13.25';
    document.getElementById('science-english-grade').value = '18.5';
    document.getElementById('science-french-grade').value = '16.75';
    document.getElementById('science-philo-grade').value = '14.5';
    
    // Sample data for tech
    document.getElementById('tech-tech-grade').value = '17.0';
    document.getElementById('tech-physics-grade').value = '16.5';
    document.getElementById('tech-arabic-grade').value = '14.25';
    document.getElementById('tech-math-grade').value = '15.0';
    document.getElementById('tech-islamics-grade').value = '16.5';
    document.getElementById('tech-history-geo-grade').value = '13.0';
    document.getElementById('tech-english-grade').value = '17.75';
    document.getElementById('tech-french-grade').value = '16.25';
    document.getElementById('tech-philo-grade').value = '15.25';
}