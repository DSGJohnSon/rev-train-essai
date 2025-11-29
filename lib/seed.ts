import connectDB from './mongodb';
import CategoryTypeModel from './models/category-type';

const defaultCategoryTypes = [
  { name: 'Lignes' },
  { name: 'Engin Moteur' },
  { name: 'Anomalies' },
  { name: 'Autres' },
];

export async function seedCategoryTypes() {
  try {
    await connectDB();

    // Vérifier si les types existent déjà
    const existingCount = await CategoryTypeModel.countDocuments();

    if (existingCount === 0) {
      console.log('🌱 Seeding default category types...');
      await CategoryTypeModel.insertMany(defaultCategoryTypes);
      console.log('✅ Default category types seeded successfully');
    } else {
      console.log('ℹ️  Category types already exist, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error seeding category types:', error);
    throw error;
  }
}

// Fonction pour réinitialiser la base de données (développement uniquement)
export async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot reset database in production!');
  }

  try {
    await connectDB();
    console.log('🗑️  Resetting database...');

    await CategoryTypeModel.deleteMany({});
    await seedCategoryTypes();

    console.log('✅ Database reset successfully');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  }
}