"use strict";

module.exports = {
  up: async (queryInterface) => {
    // 👇 Rename column from 'image' to 'pdfPath' in 'Analysis' table
    await queryInterface.renameColumn("Analysis", "image", "pdfPath");
  },

  down: async (queryInterface) => {
    // 👇 Revert back from 'pdfPath' to 'image' if rolled back
    await queryInterface.renameColumn("Analysis", "pdfPath", "image");
  },
};
