/**
 * Curated high-quality questions for KBC across all 5 official categories:
 * - Bollywood
 * - General Knowledge
 * - Blood Relation
 * - Indian History
 * - Games and Sports
 *
 * Organized by difficulty:
 * - easy: Q1 to Q5
 * - medium: Q6 to Q10
 * - medium-hard: Q11 to Q13
 * - hard: Q14 to Q16
 * - hardest: Q17 (Grand Jackpot finale ₹7 Crore)
 */

export const FALLBACK_QUESTIONS = {
  easy: [
    {
      question: "Which actor played the iconic character of 'Gabbar Singh' in the 1975 Bollywood classic film 'Sholay'?",
      options: ["Amjad Khan", "Pran", "Danny Denzongpa", "Kader Khan"],
      correctAnswer: "Amjad Khan",
      category: "Bollywood",
      difficulty: "easy",
    },
    {
      question: "Which animal is officially recognized as the National Animal of India?",
      options: ["Bengal Tiger", "Asiatic Lion", "Indian Elephant", "Snow Leopard"],
      correctAnswer: "Bengal Tiger",
      category: "General Knowledge",
      difficulty: "easy",
    },
    {
      question: "Pointing to a photograph of a boy, Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
      options: ["Father", "Uncle", "Brother", "Grandfather"],
      correctAnswer: "Father",
      category: "Blood Relation",
      difficulty: "easy",
    },
    {
      question: "Which Mughal Emperor built the magnificent white marble monument 'Taj Mahal' in Agra?",
      options: ["Shah Jahan", "Akbar", "Jahangir", "Babur"],
      correctAnswer: "Shah Jahan",
      category: "Indian History",
      difficulty: "easy",
    },
    {
      question: "In which sport is the prestigious 'Ranji Trophy' contested across India?",
      options: ["Cricket", "Football", "Field Hockey", "Kabaddi"],
      correctAnswer: "Cricket",
      category: "Games and Sports",
      difficulty: "easy",
    },
    {
      question: "Which Bollywood movie features the famous romantic song 'Tujhe Dekha Toh Yeh Jaana Sanam'?",
      options: ["Dilwale Dulhania Le Jayenge", "Kuch Kuch Hota Hai", "Hum Aapke Hain Koun..!", "Mohabbatein"],
      correctAnswer: "Dilwale Dulhania Le Jayenge",
      category: "Bollywood",
      difficulty: "easy",
    },
    {
      question: "How many days are there in a standard leap year?",
      options: ["366", "365", "364", "360"],
      correctAnswer: "366",
      category: "General Knowledge",
      difficulty: "easy",
    },
    {
      question: "Rahul says, 'Pooja is the daughter of my father's only sister.' How is Rahul related to Pooja?",
      options: ["Cousin", "Brother", "Nephew", "Uncle"],
      correctAnswer: "Cousin",
      category: "Blood Relation",
      difficulty: "easy",
    },
  ],

  medium: [
    {
      question: "Who composed the Oscar-winning song 'Jai Ho' from the movie 'Slumdog Millionaire'?",
      options: ["A. R. Rahman", "Shankar-Ehsaan-Loy", "Pritam", "Anu Malik"],
      correctAnswer: "A. R. Rahman",
      category: "Bollywood",
      difficulty: "medium",
    },
    {
      question: "Which Indian scientist was awarded the Nobel Prize in Physics in 1930 for discovering the scattering effect of light?",
      options: ["C. V. Raman", "Homi J. Bhabha", "Jagadish Chandra Bose", "Satyendra Nath Bose"],
      correctAnswer: "C. V. Raman",
      category: "General Knowledge",
      difficulty: "medium",
    },
    {
      question: "If A is the brother of B, B is the sister of C, and C is the father of D, how is D related to A?",
      options: ["Nephew or Niece", "Brother", "Cousin", "Uncle"],
      correctAnswer: "Nephew or Niece",
      category: "Blood Relation",
      difficulty: "medium",
    },
    {
      question: "Who was known as the 'Iron Man of India' and led the integration of over 500 princely states into the Indian Union?",
      options: ["Sardar Vallabhbhai Patel", "B. R. Ambedkar", "Subhas Chandra Bose", "Lal Bahadur Shastri"],
      correctAnswer: "Sardar Vallabhbhai Patel",
      category: "Indian History",
      difficulty: "medium",
    },
    {
      question: "Who was the first Indian track and field athlete to win an individual Olympic gold medal?",
      options: ["Neeraj Chopra", "Milkha Singh", "Abhinav Bindra", "P. T. Usha"],
      correctAnswer: "Neeraj Chopra",
      category: "Games and Sports",
      difficulty: "medium",
    },
    {
      question: "Which Hindi film won the National Film Award for Best Feature Film in 2001 and was nominated for the Academy Award for Best Foreign Language Film?",
      options: ["Lagaan", "Dil Chahta Hai", "Devdas", "Gadar: Ek Prem Katha"],
      correctAnswer: "Lagaan",
      category: "Bollywood",
      difficulty: "medium",
    },
    {
      question: "Which organelle is universally referred to as the 'powerhouse of the cell'?",
      options: ["Mitochondria", "Ribosome", "Nucleus", "Endoplasmic Reticulum"],
      correctAnswer: "Mitochondria",
      category: "General Knowledge",
      difficulty: "medium",
    },
  ],

  "medium-hard": [
    {
      question: "A man introduces a lady and says, 'Her mother is the only daughter of my mother-in-law.' How is the man related to the lady?",
      options: ["Father", "Uncle", "Brother", "Husband"],
      correctAnswer: "Father",
      category: "Blood Relation",
      difficulty: "medium-hard",
    },
    {
      question: "In chess, which Indian grandmaster became the youngest challenger ever to qualify for the World Chess Championship in 2024?",
      options: ["Gukesh D", "Praggnanandhaa R", "Arjun Erigaisi", "Viswanathan Anand"],
      correctAnswer: "Gukesh D",
      category: "Games and Sports",
      difficulty: "medium-hard",
    },
    {
      question: "Which legendary filmmaker directed the monumental historical Bollywood epic 'Mughal-e-Azam' (1960)?",
      options: ["K. Asif", "Mehboob Khan", "Bimal Roy", "Raj Kapoor"],
      correctAnswer: "K. Asif",
      category: "Bollywood",
      difficulty: "medium-hard",
    },
    {
      question: "Who was the chief viceroy of India when the capital of British India was shifted from Calcutta to Delhi in December 1911?",
      options: ["Lord Hardinge II", "Lord Curzon", "Lord Minto", "Lord Chelmsford"],
      correctAnswer: "Lord Hardinge II",
      category: "Indian History",
      difficulty: "medium-hard",
    },
    {
      question: "Deepa introduced Ravi saying, 'He is the son of the only son of my paternal grandfather.' How is Ravi related to Deepa?",
      options: ["Brother", "Cousin", "Father", "Uncle"],
      correctAnswer: "Brother",
      category: "Blood Relation",
      difficulty: "medium-hard",
    },
    {
      question: "Which badminton player won India's first ever Olympic medal in badminton at London 2012?",
      options: ["Saina Nehwal", "P. V. Sindhu", "Jwala Gutta", "Pullela Gopichand"],
      correctAnswer: "Saina Nehwal",
      category: "Games and Sports",
      difficulty: "medium-hard",
    },
  ],

  hard: [
    {
      question: "Which historic session of the Indian National Congress in December 1929 passed the historic resolution for 'Purna Swaraj' (Complete Independence)?",
      options: ["Lahore Session", "Calcutta Session", "Karachi Session", "Belgaum Session"],
      correctAnswer: "Lahore Session",
      category: "Indian History",
      difficulty: "hard",
    },
    {
      question: "Which is the only bone in the human skeleton that does not articulate directly with any other bone?",
      options: ["Hyoid bone", "Stapes", "Patella", "Clavicle"],
      correctAnswer: "Hyoid bone",
      category: "General Knowledge",
      difficulty: "hard",
    },
    {
      question: "Who received the very first Dadasaheb Phalke Award, India's highest cinema honor, presented in 1969?",
      options: ["Devika Rani", "Prithviraj Kapoor", "Sohrab Modi", "Biren Sircar"],
      correctAnswer: "Devika Rani",
      category: "Bollywood",
      difficulty: "hard",
    },
    {
      question: "Pointing to a photograph, Rohit said, 'The woman in the photo is the mother of the father of my son's sister.' Who is the woman to Rohit?",
      options: ["Mother", "Grandmother", "Mother-in-law", "Sister"],
      correctAnswer: "Mother",
      category: "Blood Relation",
      difficulty: "hard",
    },
    {
      question: "Which ancient university in Bihar was founded during the Gupta Dynasty reign by Kumaragupta I in the 5th century CE?",
      options: ["Nalanda University", "Takshashila", "Vikramashila", "Valabhi"],
      correctAnswer: "Nalanda University",
      category: "Indian History",
      difficulty: "hard",
    },
    {
      question: "Who was the captain of the Indian hockey team when India won its first ever Olympic gold medal in field hockey at Amsterdam 1928?",
      options: ["Jaipal Singh Munda", "Dhyan Chand", "Roop Singh", "K. D. Singh Babu"],
      correctAnswer: "Jaipal Singh Munda",
      category: "Games and Sports",
      difficulty: "hard",
    },
  ],

  hardest: [
    {
      question: "In the Maurya Empire administration described in Megasthenes' 'Indica' and Kautilya's 'Arthashastra', what was the official title of the Chief Collector of Revenue?",
      options: ["Samaharta", "Sannidhata", "Koshadhyaksha", "Karmantika"],
      correctAnswer: "Samaharta",
      category: "Indian History",
      difficulty: "hardest",
    },
    {
      question: "Which was the first feature film produced in India to feature an entirely synchronized playback singing soundtrack recorded on optical sound film in 1935?",
      options: ["Dhoop Chhaon", "Alam Ara", "Kismet", "Achhut Kanya"],
      correctAnswer: "Dhoop Chhaon",
      category: "Bollywood",
      difficulty: "hardest",
    },
    {
      question: "Examining family ancestry: Ananya says, 'Her maternal grandmother's only child is the mother of my sister's brother.' How is the woman related to Ananya?",
      options: ["Mother", "Paternal Aunt", "Maternal Aunt", "Sister"],
      correctAnswer: "Mother",
      category: "Blood Relation",
      difficulty: "hardest",
    },
    {
      question: "In ancient Indian astronomy, which text composed by Varahamihira in the 6th century CE compiles five earlier astronomical treatises including the Surya Siddhanta and Romaka Siddhanta?",
      options: ["Pancha-Siddhantika", "Aryabhatiya", "Brihat Samhita", "Khandakhadyaka"],
      correctAnswer: "Pancha-Siddhantika",
      category: "Indian History",
      difficulty: "hardest",
    },
    {
      question: "Who was the first Indian woman to win an individual medal at the Paralympic Games, winning silver in shot put at Rio 2016?",
      options: ["Deepa Malik", "Bhavina Patel", "Avani Lekhara", "Ekta Bhyan"],
      correctAnswer: "Deepa Malik",
      category: "Games and Sports",
      difficulty: "hardest",
    },
  ],
};
