const fs = require('fs');
const path = require('path');

// Common aliases to normalize
const commonAliases = [
  /-v\d+$/,        // Matches version aliases like -v1, -v2, etc.
  /-dev$/,         // Matches -dev for development environment
  /-prod$/,        // Matches -prod for production environment
  /-staging$/,     // Matches -staging for staging environment
  /-test$/,        // Matches -test for testing environment
  /-latest$/,      // Matches -latest alias
  /-stable$/,      // Matches -stable alias
  /-alpha$/,       // Matches -alpha alias
  /-beta$/,        // Matches -beta alias
  /-rc$/,          // Matches -rc (release candidate) alias
];

// Read the package.json once
const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// Function to get dependencies from package.json
const getDependencies = () => {
  return { ...packageJson.dependencies, ...packageJson.devDependencies };
};

// Function to normalize package names and check for duplicates
const checkDuplicates = () => {
  const dependencies = getDependencies();
  const duplicateDeps = {};

  Object.entries(dependencies).forEach(([pkgName, version]) => {
    // Normalize the package name by removing common aliases
    let normalizedPkgName = pkgName;
    commonAliases.forEach(alias => {
      normalizedPkgName = normalizedPkgName.replace(alias, '');
    });

    // Add the version to the set for that package
    if (!duplicateDeps[normalizedPkgName]) {
      duplicateDeps[normalizedPkgName] = new Set();
    }
    duplicateDeps[normalizedPkgName].add(version);
  });

  // Log duplicates
  Object.entries(duplicateDeps).forEach(([pkgName, versions]) => {
    if (versions.size > 1) {
      console.log(`Duplicate package detected: ${pkgName} with versions: ${[...versions].join(', ')}`);
    }
  });
};

// Run the duplicate check
checkDuplicates();
